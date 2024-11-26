"use client";

import React, { useState, useEffect } from "react";

interface FormField {
  id: string;
  alias: string;
  caption: string;
  mandatory: boolean;
  requiredErrorMessage: string;
}

interface ContactFormProps {
  locale: string;
}

interface FormValues {
  [key: string]: string | boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({ locale }) => {
  const [formData, setFormData] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({});
  const [isLoading, setIsLoading] = useState(true);

  const formId = locale === "en" ? "d6c1cc68-6ee0-42a9-8832-687bfb4f83d4" : "b2823026-86c2-450c-a16c-e130c526afac";

  useEffect(() => {
    const fetchFormData = async () => {
      if (!formId) return;
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:39457/api/umbracoformsapi/${formId}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const form = await response.json();
        setFormData(form);
      } catch (err: any) {
        setFormError(err.message || "An error occurred while fetching form data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormData();
  }, [formId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};

    formData?.fields.forEach((field: FormField) => {
      if (field.mandatory && !formValues[field.alias]?.toString().trim()) {
        errors[field.alias] = field.requiredErrorMessage || "This field is required.";
      }
    });

    if (Object.keys(errors).length > 0) {
      locale === "en" ? setFormError("Please fill in all required fields.") : setFormError("Vänligen fyll i alla nödvändiga fält.");
      return;
    }

    try {
      const response = await fetch("http://localhost:39457/api/umbracoformsapi/submitForm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formValues, formId }),
      });

      if (response.ok) {
        locale === "en" ? alert("Form submitted successfully!") : alert("Formuläret har skickats!");
        setFormValues({});
      } else {
        throw locale === "en" ? new Error("Failed to submit form.") : new Error("Det gick inte att skicka formuläret.");
      }
    } catch (err) {
      setFormError((err as Error).message || locale === "en" ? "An error occurred while submitting the form." : "Ett fel uppstod när formuläret skickades.");
    }
  };

  return (
      <div className="flex justify-center">
        {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-mid"></div>
            </div>
        ) : formData?.fields?.length > 0 ? (
            <form className="w-[90%] flex-col justify-center align-center m-10" onSubmit={handleSubmit}>
              {formData?.fields?.map((field: FormField) => (
                  <div key={field.id} className="my-2">
                    <label htmlFor={field.alias} className="block text-white">
                      {field.caption} {field.mandatory && <span className="text-red-500">*</span>}
                    </label>

                    {field.alias === "dataConsent" ? (
                        <input
                            id={field.alias}
                            name={field.alias}
                            type="checkbox"
                            checked={!!formValues[field.alias]}
                            onChange={handleInputChange}
                            className="w-6 h-6 mt-1 text-blue-600 bg-white rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                    ) : (
                        <input
                            id={field.alias}
                            name={field.alias}
                            type="text"
                            value={formValues[field.alias] ? String(formValues[field.alias]) : ""}
                            onChange={handleInputChange}
                            className="w-full p-2 mt-1 rounded-md bg-white text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    )}
                  </div>
              ))}

              {formError && <p className="text-red-500 text-sm">{formError}</p>}

              <button type="submit" className="w-full p-2 mt-4 bg-blue-500 text-white rounded-md">
                {locale === "en" ? "Submit" : "Skicka"}
              </button>
            </form>
        ) : (
            <p className="text-red-500">{locale === "en" ? "Form could not be loaded." : "Formuläret kunde inte laddas."}</p>
        )}
      </div>
  );
};

export default ContactForm;