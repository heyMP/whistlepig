export interface TrialBase {
  product: string;
  subscriptionStart: string;
}

export interface ActiveTrial extends TrialBase {
  daysLeft: number;
  totalDays: number;
}

export interface ExpiredTrial extends TrialBase {
  renewalOpenBy: string;
}

export interface LearningResource {
  title: string;
  description: string;
  buttonLabel: string;
}

export interface LearningBanner {
  title: string;
  description: string;
  buttonLabel: string;
}

export const activeTrials: ActiveTrial[] = [
  {
    product: 'Red Hat OpenShift Platform Plus for Developers Sandbox',
    subscriptionStart: '2025-08-23',
    daysLeft: 160,
    totalDays: 180,
  },
  {
    product: 'Red Hat OpenShift Container Platform',
    subscriptionStart: '2025-07-23',
    daysLeft: 27,
    totalDays: 60,
  },
  {
    product: 'Red Hat Enterprise Linux for SAP',
    subscriptionStart: '2025-07-29',
    daysLeft: 9,
    totalDays: 60,
  },
  {
    product: 'Red Hat Developer Suite',
    subscriptionStart: '2025-06-15',
    daysLeft: 45,
    totalDays: 90,
  },
];

export const expiredTrials: ExpiredTrial[] = [
  {
    product: 'Red Hat Enterprise Linux Server',
    subscriptionStart: '2022-12-09',
    renewalOpenBy: '2023-12-09',
  },
  {
    product: 'Red Hat Advanced Cluster Management for Kubernetes',
    subscriptionStart: '2019-10-17',
    renewalOpenBy: '2020-10-17',
  },
  {
    product: 'Red Hat Ansible Automation Platform',
    subscriptionStart: '2023-03-01',
    renewalOpenBy: '2024-03-01',
  },
  {
    product: 'Red Hat OpenShift Data Foundation',
    subscriptionStart: '2022-06-10',
    renewalOpenBy: '2023-06-10',
  },
];

export const learningResources: LearningResource[] = [
  {
    title: 'Customer Portal labs',
    description: 'Hands-on labs and sandbox environments to explore Red Hat products.',
    buttonLabel: 'Visit Customer Portal',
  },
  {
    title: 'Developer learning center',
    description: 'Resources and tutorials for developers building on Red Hat technologies.',
    buttonLabel: 'Start learning',
  },
  {
    title: 'Training courses',
    description: 'Instructor-led and self-paced training for Red Hat products.',
    buttonLabel: 'View courses',
  },
];

export const learningBanner: LearningBanner = {
  title: 'Explore Red Hat interactive labs',
  description:
    'Learn new Red Hat technologies, practice your skills, and get hands-on experience with Red Hat products and solutions.',
  buttonLabel: 'Get started',
};
