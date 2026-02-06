import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Does it work on any website?',
    answer: 'NavAI is in beta and works best on common website patterns like forms, navigation menus, and standard UI elements. We\'re continuously improving coverage. The demo shows a simulation of how it works.',
  },
  {
    question: 'What about my privacy?',
    answer: 'All interaction data stays on your device. The demo uses no external analytics. The Chrome extension will optionally use an AI provider for smarter guidance, but this is transparent and configurable.',
  },
  {
    question: 'Can I turn it off?',
    answer: 'Yes, always. You can pause, skip steps, or stop NavAI at any time. All adaptive features can be disabled with a single toggle.',
  },
  {
    question: 'Is it accessible?',
    answer: 'Absolutely. NavAI supports full keyboard navigation, works with screen readers, respects reduced-motion preferences, and offers high-contrast mode. Accessibility is a core feature, not an afterthought.',
  },
];

export function FAQ() {
  return (
    <section className="py-24 md:py-32 bg-navai-surface">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-display-sm md:text-display-md font-semibold tracking-tight text-center mb-12">
            Questions
          </h2>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-background rounded-xl px-6 border-none"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5 text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
