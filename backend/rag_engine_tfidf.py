"""

RAG Engine - TF-IDF Version

Uses TF-IDF similarity instead of embeddings (much faster!)

"""


 

import os

import pickle

import numpy as np

from typing import List, Dict, Optional

import logging

import time

from sklearn.metrics.pairwise import cosine_similarity

from metrics import metrics_tracker


 

logger = logging.getLogger(__name__)

# Import Hugging Face for AI generation
try:
    from huggingface_hub import InferenceClient
    HUGGINGFACE_AVAILABLE = True
except ImportError:
    HUGGINGFACE_AVAILABLE = False
    logger.warning("huggingface_hub not installed. Please install: pip install huggingface_hub")


 

class RAGEngine:

    """

    Retrieval-Augmented Generation Engine using TF-IDF similarity.

    """

   

    def __init__(self, knowledge_base_path="data/knowledge_base.pkl"):

        """Initialize the RAG engine."""

        # Log current working directory for debugging
        logger.info(f"Current working directory: {os.getcwd()}")
        logger.info(f"Looking for knowledge base at: {knowledge_base_path}")
        
        self.knowledge_base_path = knowledge_base_path

        self.tickets = None

        self.vectorizer = None

        self.tfidf_matrix = None

        self.hf_client = None  # Hugging Face client
        self.ai_provider = "huggingface"  # Only using Hugging Face

       

        # Configuration

        self.top_k = int(os.getenv("TOP_K_SIMILAR", "5"))

        self.min_similarity = float(os.getenv("MIN_SIMILARITY", "0.25"))  # Higher threshold for more relevant matches

       

        # Initialize Hugging Face AI

        self._init_huggingface_client()

       

        # Load knowledge base

        self._load_knowledge_base()

   

    def _init_huggingface_client(self) -> bool:
        """Initialize Hugging Face client for AI-powered resolutions. Returns True if successful."""
        if not HUGGINGFACE_AVAILABLE:
            logger.warning("Hugging Face not available. Install: pip install huggingface_hub")
            return False
        
        try:
            # Get Hugging Face API token (optional - works without it but with rate limits)
            hf_token = os.getenv("HUGGINGFACE_API_TOKEN")
            
            # Initialize Hugging Face Inference Client
            # Using Qwen - free chat model that works with serverless inference
            model = os.getenv("HF_MODEL", "Qwen/Qwen2.5-Coder-32B-Instruct")
            
            self.hf_client = InferenceClient(
                model=model,
                token=hf_token  # None = use free tier
            )
            
            if hf_token:
                logger.info(f"✅ Hugging Face AI initialized with model: {model} (with API token)")
            else:
                logger.info(f"✅ Hugging Face AI initialized with model: {model} (free tier)")
                logger.info("   Get free API token at: https://huggingface.co/settings/tokens")
            
            self.ai_provider = "huggingface"
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize Hugging Face: {e}")
            self.hf_client = None
            return False
    
    def has_ai_client(self) -> bool:
        """Check if Hugging Face AI client is available."""
        return self.hf_client is not None

   

    def _load_knowledge_base(self):

        """Load the pre-built knowledge base."""
        
        # Check if knowledge base exists and try to load it
        kb_exists = os.path.exists(self.knowledge_base_path)
        
        if kb_exists:
            try:
                # Try to load it
                with open(self.knowledge_base_path, 'rb') as f:
                    data = pickle.load(f)
                    # Test if vectorizer works
                    test_text = ["test"]
                    data['vectorizer'].transform(test_text)
                    
                # If we got here, it works!
                self.tickets = data['tickets']
                self.vectorizer = data['vectorizer']
                self.tfidf_matrix = data['tfidf_matrix']
                logger.info(f"Loaded knowledge base with {len(self.tickets)} tickets")
                logger.info(f"TF-IDF matrix shape: {self.tfidf_matrix.shape}")
                return
                
            except Exception as e:
                logger.warning(f"Existing knowledge base is incompatible: {e}")
                logger.info("Will rebuild knowledge base...")
                # Delete the incompatible file
                try:
                    os.remove(self.knowledge_base_path)
                except:
                    pass
        
        # Build new knowledge base
        logger.info("Attempting to build knowledge base from Sample-Data.xlsx...")
        build_success = self._build_knowledge_base_from_excel()
        
        if not build_success or not os.path.exists(self.knowledge_base_path):
            logger.error("Failed to build knowledge base. Please run: python scripts/build_knowledge_base_tfidf.py")
            logger.error("RAG engine will not be functional!")
            return
        
        # Load the newly built knowledge base
        try:
            with open(self.knowledge_base_path, 'rb') as f:
                data = pickle.load(f)
                self.tickets = data['tickets']
                self.vectorizer = data['vectorizer']
                self.tfidf_matrix = data['tfidf_matrix']
            logger.info(f"Loaded newly built knowledge base with {len(self.tickets)} tickets")
            logger.info(f"TF-IDF matrix shape: {self.tfidf_matrix.shape}")
        except Exception as e:
            logger.error(f"Failed to load newly built knowledge base: {e}")
            raise

    
    def _build_knowledge_base_from_excel(self):
        """Build knowledge base from Excel file on startup."""
        try:
            import pandas as pd
            from sklearn.feature_extraction.text import TfidfVectorizer
            
            # Try multiple possible paths
            possible_paths = [
                "data/Sample-Data.xlsx",
                "backend/data/Sample-Data.xlsx",
                "/app/backend/data/Sample-Data.xlsx"
            ]
            
            excel_path = None
            for path in possible_paths:
                logger.info(f"Checking for Excel at: {path}")
                if os.path.exists(path):
                    excel_path = path
                    logger.info(f"Found Excel file at: {path}")
                    break
            
            if not excel_path:
                logger.error(f"Sample data not found in any of: {possible_paths}")
                logger.info(f"Files in current directory: {os.listdir('.')}")
                if os.path.exists('data'):
                    logger.info(f"Files in data/: {os.listdir('data')}")
                return
            
            logger.info(f"Building knowledge base from {excel_path}...")
            
            # Read Excel file
            df = pd.read_excel(excel_path)
            
            # Detect columns (simple version)
            col_mapping = {}
            for col in df.columns:
                col_lower = col.strip().lower()
                if 'category' in col_lower or 'type' in col_lower:
                    col_mapping['category'] = col
                elif 'description' in col_lower or 'issue' in col_lower:
                    col_mapping['description'] = col
                elif 'resolution' in col_lower or 'solution' in col_lower:
                    col_mapping['resolution'] = col
                elif 'priority' in col_lower:
                    col_mapping['priority'] = col
            
            if 'description' not in col_mapping or 'resolution' not in col_mapping:
                logger.error("Could not find required columns (description, resolution)")
                return
            
            # Build tickets list
            tickets = []
            for idx, row in df.iterrows():
                ticket = {
                    'ticket_id': f"T{idx+1:04d}",
                    'category': row.get(col_mapping.get('category', ''), 'General'),
                    'description': str(row[col_mapping['description']]),
                    'resolution': str(row[col_mapping['resolution']]),
                    'priority': row.get(col_mapping.get('priority', ''), 'Medium')
                }
                tickets.append(ticket)
            
            # Build TF-IDF vectors
            logger.info("Building TF-IDF vectors...")
            vectorizer = TfidfVectorizer(
                max_features=3000,  # Increased for better vocabulary coverage
                stop_words='english',
                ngram_range=(1, 3),  # Include trigrams for better phrase matching
                min_df=1,  # Keep rare but specific terms (like "Teams", "login")
                max_df=0.7,  # More aggressive filtering of common terms
                sublinear_tf=True,  # Use log scaling for term frequency
                token_pattern=r'(?u)\b[a-zA-Z][a-zA-Z]+\b'  # Only words with 2+ letters
            )
            
            # Combine category and description with smart weighting
            # Category 3x weight helps category matching, description is the main content
            texts = [f"{t['category']} {t['category']} {t['category']} {t['description']}" for t in tickets]
            tfidf_matrix = vectorizer.fit_transform(texts)
            
            # Save knowledge base
            os.makedirs(os.path.dirname(self.knowledge_base_path), exist_ok=True)
            with open(self.knowledge_base_path, 'wb') as f:
                pickle.dump({
                    'tickets': tickets,
                    'vectorizer': vectorizer,
                    'tfidf_matrix': tfidf_matrix
                }, f)
            
            logger.info(f"Knowledge base built successfully with {len(tickets)} tickets")
            return True
            
        except Exception as e:
            logger.error(f"Failed to build knowledge base: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return False

   

    def find_similar_tickets(self, query_text: str, k: int = None, category: str = None) -> List[Dict]:

        """

        Find similar tickets using TF-IDF similarity with category filtering.

       

        Args:

            query_text: The ticket description to find similar tickets for

            k: Number of similar tickets to return
            category: Optional category to prioritize in results

       

        Returns:

            List of similar tickets with similarity scores

        """

        if not self.is_ready():

            raise RuntimeError("RAG engine not ready. Knowledge base not loaded.")

       

        k = k or self.top_k

       

        # Transform query using TF-IDF vectorizer

        query_vec = self.vectorizer.transform([query_text])

       

        # Calculate cosine similarity

        similarities = cosine_similarity(query_vec, self.tfidf_matrix)[0]

       

        # Get top k*3 indices to allow for category filtering

        top_indices = similarities.argsort()[-(k*3):][::-1]

       

        # Extract key terms from query for keyword matching
        query_lower = query_text.lower()
        query_words = set(query_lower.split())
        
        # Build result list with category and keyword boosting

        similar_tickets = []

        for idx in top_indices:

            score = float(similarities[idx])

            if score >= self.min_similarity:

                ticket = self.tickets[idx].copy()
                
                # Apply category boost if categories match
                if category and ticket.get('category', '').lower() == category.lower():
                    # Boost by 30% for exact category match
                    score = min(score * 1.3, 1.0)
                
                # Apply keyword boost for important matching terms
                ticket_text = f"{ticket.get('description', '')} {ticket.get('resolution', '')}".lower()
                ticket_words = set(ticket_text.split())
                
                # Check for important keyword matches (login, teams, password, etc.)
                important_keywords = query_words & ticket_words
                if len(important_keywords) >= 2:  # At least 2 matching important words
                    score = min(score * 1.15, 1.0)  # 15% boost
                
                ticket['similarity_score'] = score

                similar_tickets.append(ticket)

       

        # Sort by final score (after category boosting)
        similar_tickets.sort(key=lambda x: x['similarity_score'], reverse=True)

        # Return only top k after filtering and sorting

        return similar_tickets[:k]

   

    def _generate_template_resolution(self, best_ticket: Dict) -> str:

        """Generate a template-based resolution when AI is not available."""

        resolution = f"""Based on similar resolved tickets, here's the suggested resolution:


 

{best_ticket['resolution']}


 

Note: This resolution is based on a similar ticket with {best_ticket['similarity_score']:.0%} similarity match.

Category: {best_ticket['category']}


 

Please adapt the steps above to your specific situation. If you need further assistance, contact IT support."""

        return resolution
    
    def _generate_ai_fallback_resolution(self, category: str, priority: str, description: str) -> str:

        """

        Generate an AI-powered resolution when no similar tickets are found.

        Uses Azure OpenAI or Hugging Face (free alternative) to provide intelligent troubleshooting steps.

        """

        try:

            system_prompt = """You are an expert IT support assistant with deep knowledge across various technical domains including:

- Hardware issues (printers, computers, monitors, peripherals)

- Software problems (applications, OS issues, installations)

- Network connectivity (Wi-Fi, VPN, ethernet)

- Account and access issues (passwords, permissions, login problems)

- Email and communication tools

- Security concerns


 

Your task is to provide clear, actionable troubleshooting steps even without historical ticket data.

Provide step-by-step resolution guidance that is:

1. Professional and easy to follow

2. Comprehensive with common troubleshooting steps

3. Escalation path if the issue persists

4. Safety warnings if applicable"""


 

            user_query = f"""I need help resolving an IT support ticket with the following details:


 

Category: {category}

Priority: {priority}

Issue Description: {description}


 

Please provide a detailed step-by-step resolution guide for this issue.

Include:

1. Initial diagnostic steps

2. Common solutions for this type of problem

3. Advanced troubleshooting if basic steps don't work

4. When to escalate to senior support or specialists

5. Any important warnings or precautions


 

Format your response clearly with numbered steps."""

            
            # Try Azure OpenAI first
            if self.client and self.ai_provider == "azure":
                deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4.1")
               
                response = self.client.chat.completions.create(

                    model=deployment_name,

                    messages=[

                        {"role": "system", "content": system_prompt},

                        {"role": "user", "content": user_query}

                    ],

                    temperature=0.7,

                    max_tokens=800  # Allow longer responses for detailed troubleshooting

                )

               

                ai_resolution = response.choices[0].message.content
            
            # Fallback to Hugging Face (free alternative)
            elif self.hf_client and self.ai_provider == "huggingface":
                # Use chat completion format
                full_prompt = f"{system_prompt}\n\n{user_query}"
                
                messages = [{"role": "user", "content": full_prompt}]
                
                response = self.hf_client.chat_completion(
                    messages=messages,
                    max_tokens=800,
                    temperature=0.7
                )
                
                ai_resolution = response.choices[0].message.content
            
            else:
                raise Exception("No AI provider available")

           

            # Add disclaimer

            full_resolution = f"""⚠️ **AI-Generated Solution** (No similar historical tickets found)


 

{ai_resolution}


 

---

**Note:** This resolution was generated by AI based on general IT support knowledge. Since no similar tickets were found in the historical database, please verify these steps are appropriate for your specific environment. If the issue persists, please contact IT support for personalized assistance."""

           

            return full_resolution

           

        except Exception as e:

            logger.error(f"Failed to generate AI fallback resolution: {e}")

            # Return a generic but helpful fallback

            return f"""⚠️ **No Similar Tickets Found**


 

We couldn't find similar resolved tickets in our database for this issue.


 

**Suggested Next Steps:**


 

1. **Basic Troubleshooting:**

   - Restart the affected application/device

   - Check for any error messages and note them down

   - Verify your network connectivity

   - Clear browser cache if it's a web-based issue


 

2. **Gather Information:**

   - Category: {category}

   - Priority: {priority}

   - Take screenshots of any error messages

   - Note when the issue started


 

3. **Contact IT Support:**

   - Provide all the information gathered above

   - Mention that this is a new or rare issue (Priority: {priority})

   - Reference ticket category: {category}


 

**Emergency Contact:** If this is a critical issue affecting your work, please contact IT support immediately.


 

Note: AI-powered detailed resolution generation encountered an error. Please contact support for personalized assistance."""

   

    def _build_prompt(self, category: str, priority: str, description: str,

                     similar_tickets: List[Dict]) -> str:

        """Build prompt with context from similar tickets."""

       

        # System instruction

        system_prompt = """You are an expert IT support assistant specializing in ticket resolution.

You provide clear, step-by-step solutions to technical problems based on historical ticket resolutions.

Your responses are professional, concise, and actionable."""

       

        # Build context from similar tickets

        context = "Here are some similar tickets and their resolutions:\n\n"

       

        for i, ticket in enumerate(similar_tickets[:3], 1):  # Use top 3

            context += f"Example {i}:\n"

            context += f"Category: {ticket['category']}\n"

            context += f"Issue: {ticket['description']}\n"

            context += f"Resolution: {ticket['resolution']}\n"

            context += f"Similarity: {ticket['similarity_score']:.2f}\n\n"

       

        # Build user query

        user_query = f"""Based on the similar tickets above, please provide a resolution for this new ticket:


 

Category: {category}

Priority: {priority}

Issue: {description}


 

Provide a clear, step-by-step resolution that follows the patterns from the similar tickets above.

Be specific and actionable."""

       

        return system_prompt, user_query

   

    def suggest_resolution(self, category: str, priority: str, description: str) -> Dict:

        """

        Suggest resolution for a ticket using RAG approach.

       

        Args:

            category: Ticket category

            priority: Ticket priority

            description: Ticket description

       

        Returns:

            Dict with suggested resolution and similar tickets

        """

        try:

            # Start total timer

            total_start_time = time.time()

           

            # Combine inputs for better similarity search
            # Match the weighting used during knowledge base building (3x category weight)
            query_text = f"{category} {category} {category} {description}"

           

            # Find similar tickets (time this step)

            search_start_time = time.time()

            similar_tickets = self.find_similar_tickets(query_text, k=self.top_k, category=category)

            search_time = time.time() - search_start_time

           

            if not similar_tickets:

                logger.warning("No similar tickets found - Using AI-powered fallback")

                
                # Generate AI-powered solution even without similar tickets
                generation_start_time = time.time()
                
                if self.has_ai_client():
                    # Use Azure OpenAI to generate solution without similar tickets
                    ai_resolution = self._generate_ai_fallback_resolution(
                        category, priority, description
                    )
                    generation_time = time.time() - generation_start_time
                    total_time = time.time() - total_start_time
                    
                    logger.info("=" * 60)
                    logger.info("⚠️  NO SIMILAR TICKETS - AI FALLBACK MODE")
                    logger.info("=" * 60)
                    logger.info(f"🔍 Search time: {search_time * 1000:.2f} ms")
                    logger.info(f"🤖 AI Generation time: {generation_time * 1000:.2f} ms")
                    logger.info(f"⚡ Total time: {total_time * 1000:.2f} ms")
                    logger.info("=" * 60)
                    
                    # Record metrics
                    try:
                        metrics_tracker.record_query(
                            category=category,
                            response_time=total_time * 1000,
                            confidence=0.5,  # Moderate confidence for AI-generated solutions
                            success=True,
                        )
                    except Exception as e:
                        logger.warning(f"Failed to record metrics: {e}")
                    
                    return {
                        "suggested_resolution": ai_resolution,
                        "confidence": 0.5,  # Moderate confidence for AI-generated
                        "similar_tickets": [],
                        "method": "ai-fallback",
                        "timing": {
                            "search_time_ms": round(search_time * 1000, 2),
                            "generation_time_ms": round(generation_time * 1000, 2),
                            "total_time_ms": round(total_time * 1000, 2)
                        },
                        "metadata": {
                            "model": os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4.1"),
                            "num_similar_tickets": 0,
                            "ai_generated": True,
                            "note": "Generated using AI without similar ticket context"
                        }
                    }
                else:
                    # No Azure client available
                    total_time = time.time() - total_start_time
                    return {
                        "suggested_resolution": "No similar tickets found. Please create a manual resolution or contact support.\n\nNote: AI-powered suggestions are currently unavailable. Please configure Azure OpenAI credentials to enable intelligent fallback solutions.",
                        "confidence": 0.0,
                        "similar_tickets": [],
                        "method": "fallback",
                        "timing": {
                            "search_time_ms": round(search_time * 1000, 2),
                            "generation_time_ms": 0,
                            "total_time_ms": round(total_time * 1000, 2)
                        },
                        "metadata": {
                            "num_similar_tickets": 0,
                            "azure_unavailable": True
                        }
                    }

           

            # Generate resolution

            generation_start_time = time.time()
            
            # Calculate average similarity
            avg_similarity = np.mean([t['similarity_score'] for t in similar_tickets])
            
            # NEW STRATEGY: Always use AI to refine solutions (even 100% matches)
            # This ensures every resolution is properly adapted and refined
            use_ai_refinement = True
            
            # Initialize deployment_name with default
            deployment_name = "unknown"

           
            # Debug: Check AI client status
            logger.info(f"AI Client available: {self.has_ai_client()}, HF Client: {self.hf_client is not None}")

            if self.has_ai_client():
                # Use Hugging Face AI to refine solution based on similar tickets
                logger.info(f"🤖 Using AI to refine resolution (confidence: {avg_similarity:.1%})")
                
                try:
                    # Build context from similar tickets
                    similar_context = "\n\n".join([
                        f"Similar Ticket #{i+1} (Match: {t['similarity_score']:.0%}):\n"
                        f"Category: {t['category']}\n"
                        f"Description: {t['description'][:200]}\n"
                        f"Resolution: {t['resolution'][:300]}"
                        for i, t in enumerate(similar_tickets[:3])  # Top 3 matches
                    ])
                    
                    # Create prompt for Hugging Face
                    # Extract key info from best matches
                    best_resolutions = "\n".join([
                        f"{i+1}. {t['resolution'][:250]}" 
                        for i, t in enumerate(similar_tickets[:3])
                    ])
                    
                    prompt = f"""You are a professional IT Support Specialist. Provide a clear, structured resolution for the following technical issue.

**Incident Details:**
- Category: {category}
- Priority: {priority}
- Issue: {description}

**Reference Resolutions:**
{best_resolutions}

**Instructions:**
Provide a professional, step-by-step resolution (5-8 actionable steps) that:
1. Uses clear, professional language
2. Includes specific technical steps
3. Provides troubleshooting alternatives
4. Indicates when to escalate

Format your response as numbered steps without preamble."""

                    # Call Hugging Face using chat completion format
                    messages = [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                    
                    response = self.hf_client.chat_completion(
                        messages=messages,
                        max_tokens=450,  # Enough for detailed professional steps
                        temperature=0.4  # Lower for more professional, factual output
                    )
                    
                    # Extract the response text
                    ai_text = response.choices[0].message.content
                    
                    suggested_resolution = f"""## AI-Generated Resolution

{ai_text}

---
*No similar tickets found in the database. This resolution was generated using AI based on IT support best practices.*"""
                    
                    deployment_name = os.getenv("HF_MODEL", "Qwen/Qwen2.5-Coder-32B-Instruct")

                except Exception as e:

                    logger.error(f"Hugging Face AI call failed: {e}")
                    import traceback
                    logger.error(f"Traceback: {traceback.format_exc()}")

                    # Fallback to template-based resolution

                    suggested_resolution = self._generate_template_resolution(similar_tickets[0])
                    deployment_name = "template-fallback"

            else:

                # Use template-based resolution (no AI)

                suggested_resolution = self._generate_template_resolution(similar_tickets[0])
                deployment_name = "template"

           

            generation_time = time.time() - generation_start_time

           

            # Calculate total time

            total_time = time.time() - total_start_time

           

            # Confidence already calculated above

            confidence = float(avg_similarity)

           

            # Log timing information to console

            logger.info("=" * 60)

            logger.info("⏱️  PERFORMANCE METRICS")

            logger.info("=" * 60)

            logger.info(f"🔍 Search time: {search_time * 1000:.2f} ms")

            logger.info(f"🤖 Generation time: {generation_time * 1000:.2f} ms")

            logger.info(f"⚡ Total time: {total_time * 1000:.2f} ms")

            logger.info(f"📊 Similar tickets found: {len(similar_tickets)}")

            logger.info(f"🎯 Confidence: {confidence:.4f}")
            logger.info(f"🤖 Resolution method: AI-Refined (Hugging Face)")

            logger.info("=" * 60)

           

            # Record metrics (store total response time in ms)
            try:
                metrics_tracker.record_query(
                    category=category,
                    response_time=total_time * 1000,
                    confidence=confidence,
                    success=True,
                )
            except Exception as e:
                logger.warning(f"Failed to record metrics: {e}")

           

            # Format similar tickets for response

            formatted_similar_tickets = []

            for ticket in similar_tickets:

                formatted_similar_tickets.append({

                    "ticket_id": ticket.get('ticket_id', 'N/A'),

                    "category": ticket['category'],

                    "description": ticket['description'][:200],  # Truncate long descriptions

                    "resolution": ticket['resolution'][:300],  # Truncate long resolutions

                    "priority": ticket.get('priority', 'N/A'),

                    "similarity_score": float(ticket['similarity_score'])  # Convert numpy float to Python float

                })

           

            return {

                "suggested_resolution": suggested_resolution,

                "confidence": float(confidence),  # Ensure Python float

                "similar_tickets": formatted_similar_tickets,

                "method": "ai-refined",

                "timing": {

                    "search_time_ms": round(search_time * 1000, 2),

                    "generation_time_ms": round(generation_time * 1000, 2),

                    "total_time_ms": round(total_time * 1000, 2)

                },

                "metadata": {
                    "model": deployment_name,
                    "ai_provider": self.ai_provider if self.has_ai_client() else "template",
                    "num_similar_tickets": len(similar_tickets),
                    "avg_similarity": float(confidence),  # Ensure Python float
                    "resolution_strategy": "AI-Refined Resolution",
                    "ai_generated": True  # Always using AI now
                }

            }

       

        except Exception as e:

            logger.error(f"Error generating resolution: {e}")

            raise

   

    def is_ready(self) -> bool:
        """Check if RAG engine is ready (works without Azure)."""
        return (
            self.tickets is not None and
            self.vectorizer is not None and
            self.tfidf_matrix is not None
        )

    def azure_connected(self) -> bool:
        """Whether Azure client is configured and usable."""
        return self.client is not None

   

    def get_knowledge_base_size(self) -> int:

        """Get the number of tickets in knowledge base."""

        return len(self.tickets) if self.tickets else 0

   

    def get_top_categories(self, limit: int = 10) -> Dict:

        """Get top categories from knowledge base."""

        if not self.tickets:

            return {}

       

        categories = {}

        for ticket in self.tickets:

            cat = ticket.get('category', 'Unknown')

            categories[cat] = categories.get(cat, 0) + 1

       

        # Sort by count and return top

        sorted_categories = sorted(categories.items(), key=lambda x: x[1], reverse=True)

        return dict(sorted_categories[:limit])

   

    def reload_knowledge_base(self):

        """Reload the knowledge base from disk."""

        logger.info("Reloading knowledge base...")

        self._load_knowledge_base()

        logger.info("Knowledge base reloaded successfully")


 