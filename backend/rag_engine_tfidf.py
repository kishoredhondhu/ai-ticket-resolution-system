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

from openai import AzureOpenAI

from sklearn.metrics.pairwise import cosine_similarity

from metrics import metrics_tracker


 

logger = logging.getLogger(__name__)


 

class RAGEngine:

    """

    Retrieval-Augmented Generation Engine using TF-IDF similarity.

    """

   

    def __init__(self, knowledge_base_path="data/knowledge_base.pkl"):

        """Initialize the RAG engine."""

        self.knowledge_base_path = knowledge_base_path

        self.tickets = None

        self.vectorizer = None

        self.tfidf_matrix = None

        self.client = None

       

        # Configuration

        self.top_k = int(os.getenv("TOP_K_SIMILAR", "5"))

        self.min_similarity = float(os.getenv("MIN_SIMILARITY", "0.1"))  # Lower threshold for TF-IDF

       

        # Initialize Azure OpenAI client

        self._init_azure_client()

       

        # Load knowledge base

        self._load_knowledge_base()

   

    def _init_azure_client(self):

        """Initialize Azure OpenAI client."""

        try:

            # Remove proxy environment variables

            proxy_vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy']

            for var in proxy_vars:

                if var in os.environ:

                    del os.environ[var]

           

            endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")

            api_key = os.getenv("AZURE_OPENAI_KEY")

            api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2023-05-15")

           

            if not endpoint or not api_key:

                logger.warning("Azure OpenAI credentials not configured. Service will run in limited mode.")

                logger.warning("Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY in .env file")

                self.client = None

                return

           

            self.client = AzureOpenAI(

                azure_endpoint=endpoint,

                api_key=api_key,

                api_version=api_version

            )

            logger.info("Azure OpenAI client initialized successfully")

        except Exception as e:

            logger.error(f"Failed to initialize Azure client: {e}")

            logger.warning("Service will run in limited mode (similarity search only)")

            self.client = None

   

    def _load_knowledge_base(self):

        """Load the pre-built knowledge base."""

        if not os.path.exists(self.knowledge_base_path):

            logger.warning(f"Knowledge base not found at {self.knowledge_base_path}")

            logger.info("Attempting to build knowledge base from Sample-Data.xlsx...")

            self._build_knowledge_base_from_excel()

            if not os.path.exists(self.knowledge_base_path):

                logger.warning("Failed to build knowledge base. Please run: python scripts/build_knowledge_base_tfidf.py")

                return

       

        try:

            with open(self.knowledge_base_path, 'rb') as f:

                data = pickle.load(f)

                self.tickets = data['tickets']

                self.vectorizer = data['vectorizer']

                self.tfidf_matrix = data['tfidf_matrix']

               

            logger.info(f"Loaded knowledge base with {len(self.tickets)} tickets")

            logger.info(f"TF-IDF matrix shape: {self.tfidf_matrix.shape}")

           

        except Exception as e:

            logger.error(f"Failed to load knowledge base: {e}")

            raise

    
    def _build_knowledge_base_from_excel(self):
        """Build knowledge base from Excel file on startup."""
        try:
            import pandas as pd
            from sklearn.feature_extraction.text import TfidfVectorizer
            
            excel_path = "data/Sample-Data.xlsx"
            if not os.path.exists(excel_path):
                logger.error(f"Sample data not found at {excel_path}")
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
                max_features=1000,
                stop_words='english',
                ngram_range=(1, 2)
            )
            
            texts = [f"{t['category']} {t['description']}" for t in tickets]
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
            
        except Exception as e:
            logger.error(f"Failed to build knowledge base: {e}")

   

    def find_similar_tickets(self, query_text: str, k: int = None) -> List[Dict]:

        """

        Find similar tickets using TF-IDF similarity.

       

        Args:

            query_text: The ticket description to find similar tickets for

            k: Number of similar tickets to return

       

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

       

        # Get top k indices

        top_indices = similarities.argsort()[-k:][::-1]

       

        # Build result list

        similar_tickets = []

        for idx in top_indices:

            score = float(similarities[idx])

            if score >= self.min_similarity:

                ticket = self.tickets[idx].copy()

                ticket['similarity_score'] = score

                similar_tickets.append(ticket)

       

        return similar_tickets

   

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

        Uses Azure OpenAI to provide intelligent troubleshooting steps.

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

            query_text = f"{category} {description}"

           

            # Find similar tickets (time this step)

            search_start_time = time.time()

            similar_tickets = self.find_similar_tickets(query_text, k=self.top_k)

            search_time = time.time() - search_start_time

           

            if not similar_tickets:

                logger.warning("No similar tickets found - Using AI-powered fallback")

                
                # Generate AI-powered solution even without similar tickets
                generation_start_time = time.time()
                
                if self.client:
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

           

            if self.client:

                # Use Azure OpenAI for generation

                system_prompt, user_query = self._build_prompt(

                    category, priority, description, similar_tickets

                )

               

                deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4.1")

               

                try:

                    response = self.client.chat.completions.create(

                        model=deployment_name,

                        messages=[

                            {"role": "system", "content": system_prompt},

                            {"role": "user", "content": user_query}

                        ],

                        temperature=0.7,

                        max_tokens=500

                    )

                    suggested_resolution = response.choices[0].message.content

                except Exception as e:

                    logger.error(f"Azure OpenAI API call failed: {e}")

                    # Fallback to template-based resolution

                    suggested_resolution = self._generate_template_resolution(similar_tickets[0])

            else:

                # Use template-based resolution (no AI)

                suggested_resolution = self._generate_template_resolution(similar_tickets[0])
                deployment_name = "template"

           

            generation_time = time.time() - generation_start_time

           

            # Calculate total time

            total_time = time.time() - total_start_time

           

            # Calculate confidence based on similarity scores

            avg_similarity = np.mean([t['similarity_score'] for t in similar_tickets])

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

                    "similarity_score": ticket['similarity_score']

                })

           

            return {

                "suggested_resolution": suggested_resolution,

                "confidence": confidence,

                "similar_tickets": formatted_similar_tickets,

                "method": "rag-tfidf",

                "timing": {

                    "search_time_ms": round(search_time * 1000, 2),

                    "generation_time_ms": round(generation_time * 1000, 2),

                    "total_time_ms": round(total_time * 1000, 2)

                },

                "metadata": {
                    "model": deployment_name,
                    "num_similar_tickets": len(similar_tickets),
                    "avg_similarity": confidence
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


 