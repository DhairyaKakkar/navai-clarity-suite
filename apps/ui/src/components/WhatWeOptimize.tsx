import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const features = [
  'One instruction at a time',
  'Less noise, more certainty',
  'Keyboard + screen-reader friendly',
  'Stops anytime',
];

export function WhatWeOptimize() {
  return (
    <section id="accessibility" className="py-24 md:py-32 bg-navai-surface">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-display-sm md:text-display-md font-semibold tracking-tight text-center mb-12">
            What we optimize for
          </h2>

          <ul className="space-y-4">
            {features.map((feature, index) => (
              <motion.li
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center gap-4 text-lg"
              >
                <span className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </span>
                {feature}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
