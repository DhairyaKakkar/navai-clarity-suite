import { TaskFlow } from './types';

export const taskFlows: Record<string, TaskFlow> = {
  license: {
    id: 'license',
    name: "Driver License Application",
    goal: "apply for a driver's license",
    steps: [
      {
        stepNumber: 1,
        instructionText: "Click the 'Start Application' button to begin your driver license application.",
        shortInstruction: "Click 'Start Application'",
        targetSelector: '[data-navai="start-application"]',
        expectedActionType: 'click',
        completionCondition: 'navigated-to-step-1',
        hint: "It's the green button at the top of the page."
      },
      {
        stepNumber: 2,
        instructionText: "Enter your first name in the personal information form.",
        shortInstruction: "Type your first name",
        targetSelector: '[data-navai="first-name"]',
        expectedActionType: 'type',
        completionCondition: 'field-has-value',
        hint: "This is the first field in the form."
      },
      {
        stepNumber: 3,
        instructionText: "Enter your last name.",
        shortInstruction: "Type your last name",
        targetSelector: '[data-navai="last-name"]',
        expectedActionType: 'type',
        completionCondition: 'field-has-value',
      },
      {
        stepNumber: 4,
        instructionText: "Enter your date of birth.",
        shortInstruction: "Enter your birth date",
        targetSelector: '[data-navai="dob"]',
        expectedActionType: 'type',
        completionCondition: 'field-has-value',
      },
      {
        stepNumber: 5,
        instructionText: "Click 'Continue' to proceed to the next step.",
        shortInstruction: "Click 'Continue'",
        targetSelector: '[data-navai="continue-step-1"]',
        expectedActionType: 'click',
        completionCondition: 'navigated-to-step-2',
      },
      {
        stepNumber: 6,
        instructionText: "Enter your street address.",
        shortInstruction: "Type your address",
        targetSelector: '[data-navai="address"]',
        expectedActionType: 'type',
        completionCondition: 'field-has-value',
      },
      {
        stepNumber: 7,
        instructionText: "Enter your city.",
        shortInstruction: "Type your city",
        targetSelector: '[data-navai="city"]',
        expectedActionType: 'type',
        completionCondition: 'field-has-value',
      },
      {
        stepNumber: 8,
        instructionText: "Select your state from the dropdown.",
        shortInstruction: "Select your state",
        targetSelector: '[data-navai="state"]',
        expectedActionType: 'select',
        completionCondition: 'option-selected',
      },
      {
        stepNumber: 9,
        instructionText: "Click 'Continue' to proceed to the final step.",
        shortInstruction: "Click 'Continue'",
        targetSelector: '[data-navai="continue-step-2"]',
        expectedActionType: 'click',
        completionCondition: 'navigated-to-step-3',
      },
      {
        stepNumber: 10,
        instructionText: "Upload a photo of your ID document.",
        shortInstruction: "Upload your ID",
        targetSelector: '[data-navai="upload-id"]',
        expectedActionType: 'upload',
        completionCondition: 'file-uploaded',
        hint: "Click the upload area to select a file."
      },
      {
        stepNumber: 11,
        instructionText: "Check the box to confirm your information is accurate.",
        shortInstruction: "Check the confirmation box",
        targetSelector: '[data-navai="confirm-checkbox"]',
        expectedActionType: 'click',
        completionCondition: 'checkbox-checked',
      },
      {
        stepNumber: 12,
        instructionText: "Click 'Submit Application' to complete your application.",
        shortInstruction: "Click 'Submit'",
        targetSelector: '[data-navai="submit"]',
        expectedActionType: 'click',
        completionCondition: 'form-submitted',
      },
    ],
  },
  bill: {
    id: 'bill',
    name: "Pay a Bill",
    goal: "pay a utility bill",
    steps: [
      {
        stepNumber: 1,
        instructionText: "Type your provider name in the search box to find your utility company.",
        shortInstruction: "Search for your provider",
        targetSelector: '[data-navai="provider-search"]',
        expectedActionType: 'type',
        completionCondition: 'field-has-value',
      },
      {
        stepNumber: 2,
        instructionText: "Click on your provider from the search results.",
        shortInstruction: "Select your provider",
        targetSelector: '[data-navai="provider-result"]',
        expectedActionType: 'click',
        completionCondition: 'provider-selected',
      },
      {
        stepNumber: 3,
        instructionText: "Enter your account number.",
        shortInstruction: "Enter account number",
        targetSelector: '[data-navai="account-number"]',
        expectedActionType: 'type',
        completionCondition: 'field-has-value',
      },
      {
        stepNumber: 4,
        instructionText: "Enter the payment amount.",
        shortInstruction: "Enter payment amount",
        targetSelector: '[data-navai="payment-amount"]',
        expectedActionType: 'type',
        completionCondition: 'field-has-value',
      },
      {
        stepNumber: 5,
        instructionText: "Click 'Review Payment' to see a summary before paying.",
        shortInstruction: "Click 'Review Payment'",
        targetSelector: '[data-navai="review-payment"]',
        expectedActionType: 'click',
        completionCondition: 'navigated-to-review',
      },
      {
        stepNumber: 6,
        instructionText: "Click 'Confirm Payment' to complete your bill payment.",
        shortInstruction: "Confirm payment",
        targetSelector: '[data-navai="confirm-payment"]',
        expectedActionType: 'click',
        completionCondition: 'payment-confirmed',
      },
    ],
  },
  university: {
    id: 'university',
    name: "University Portal",
    goal: "submit a course assignment",
    steps: [
      {
        stepNumber: 1,
        instructionText: "Click on 'My Courses' in the navigation menu.",
        shortInstruction: "Click 'My Courses'",
        targetSelector: '[data-navai="my-courses"]',
        expectedActionType: 'click',
        completionCondition: 'navigated-to-courses',
      },
      {
        stepNumber: 2,
        instructionText: "Click on your course to open it.",
        shortInstruction: "Select your course",
        targetSelector: '[data-navai="course-item"]',
        expectedActionType: 'click',
        completionCondition: 'course-opened',
      },
      {
        stepNumber: 3,
        instructionText: "Click on the assignment you need to submit.",
        shortInstruction: "Open the assignment",
        targetSelector: '[data-navai="assignment-item"]',
        expectedActionType: 'click',
        completionCondition: 'assignment-opened',
      },
      {
        stepNumber: 4,
        instructionText: "Click 'Upload File' to select your assignment file.",
        shortInstruction: "Upload your file",
        targetSelector: '[data-navai="upload-assignment"]',
        expectedActionType: 'upload',
        completionCondition: 'file-uploaded',
      },
      {
        stepNumber: 5,
        instructionText: "Add any comments for your instructor (optional).",
        shortInstruction: "Add a comment",
        targetSelector: '[data-navai="assignment-comment"]',
        expectedActionType: 'type',
        completionCondition: 'optional-complete',
      },
      {
        stepNumber: 6,
        instructionText: "Click 'Submit Assignment' to complete your submission.",
        shortInstruction: "Submit assignment",
        targetSelector: '[data-navai="submit-assignment"]',
        expectedActionType: 'click',
        completionCondition: 'assignment-submitted',
      },
    ],
  },
};

export function getTaskFlow(siteId: string): TaskFlow | undefined {
  return taskFlows[siteId];
}

export function matchGoalToSite(goal: string): string | null {
  const normalizedGoal = goal.toLowerCase();
  
  if (normalizedGoal.includes('license') || normalizedGoal.includes('driver') || normalizedGoal.includes('dmv')) {
    return 'license';
  }
  if (normalizedGoal.includes('bill') || normalizedGoal.includes('pay') || normalizedGoal.includes('utility')) {
    return 'bill';
  }
  if (normalizedGoal.includes('assignment') || normalizedGoal.includes('course') || normalizedGoal.includes('university') || normalizedGoal.includes('submit')) {
    return 'university';
  }
  
  return null;
}
