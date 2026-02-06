import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'You state a goal.',
    description: 'Tell NavAI what you want to accomplish.',
  },
  {
    number: '02',
    title: 'We pick the best next action.',
    description: 'NavAI reads the page and finds the right step.',
  },
  {
    number: '03',
    title: 'You complete it. We continue.',
    description: 'One step at a time until you\'re done.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-display-sm md:text-display-md font-semibold tracking-tight">
            How it works
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-navai-surface rounded-xl p-8 text-center"
            >
              <span className="inline-block text-sm font-medium text-muted-foreground mb-4">
                {step.number}
              </span>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
