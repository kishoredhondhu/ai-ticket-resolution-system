import React from "react";

interface Props {
  label: string;

  value: string;

  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;

  placeholder?: string;

  type?: string;

  required?: boolean;
}

const FormField: React.FC<Props> = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) => (
  <div className="form-field">
    <label>
      {label}

      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      )}
    </label>
  </div>
);

export default FormField;
