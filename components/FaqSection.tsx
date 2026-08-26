'use client';

import { useState } from 'react';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faqs: FAQItem[];
  title?: string;
}

export default function FaqSection({ faqs, title = 'الأسئلة الشائعة' }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="my-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-bold text-gray-900 md:text-2xl">{title}</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => toggleAccordion(index)}
                className="flex w-full items-center justify-between p-4 text-right text-base font-semibold text-gray-800 transition hover:bg-gray-100"
              >
                <span>{faq.question}</span>
                <span className="text-xl font-bold text-gray-500">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <div className="border-t border-gray-200 bg-white p-4 text-sm leading-relaxed text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}