
import { Application, ApplicationStatus, ApplicationType, CashGrant, CashGrantStatus, Complaint, RegistryRecord, Role, User, EventItem, PosterItem } from '../types';

// Helper to generate a date relative to today for mock data consistency
const getRelativeDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const MALE_AVATAR = 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-260-e1773292822209.png';
const FEMALE_AVATAR = 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-260-e1773292822209.png';

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'e1',
    title: 'Health Checkup para sa mga PWD',
    date: getRelativeDate(5),
    image: 'https://picsum.photos/seed/health/600/400',
    createdAt: { seconds: Date.now() / 1000 }
  },
  {
    id: 'e2',
    title: 'PWD Sports Fest 2026',
    date: getRelativeDate(15),
    image: 'https://picsum.photos/seed/sports/600/400',
    createdAt: { seconds: (Date.now() - 86400000) / 1000 }
  },
  {
    id: 'e3',
    title: 'Seminar on Digital Literacy',
    date: getRelativeDate(2),
    image: 'https://picsum.photos/seed/tech/600/400',
    createdAt: { seconds: (Date.now() - 172800000) / 1000 }
  }
];

export const INITIAL_POSTERS: PosterItem[] = [
  {
    id: 'p1',
    title: 'Libreng Gamot para sa PWD',
    image: 'https://picsum.photos/seed/medicine/600/400',
    createdAt: { seconds: Date.now() / 1000 }
  },
  {
    id: 'p2',
    title: 'Job Fair for Persons with Disabilities',
    image: 'https://picsum.photos/seed/jobs/600/400',
    createdAt: { seconds: (Date.now() - 86400000) / 1000 }
  },
  {
    id: 'p3',
    title: 'San Juan City Anniversary Celebration',
    image: 'https://picsum.photos/seed/city/600/400',
    date: getRelativeDate(10),
    createdAt: { seconds: (Date.now() - 172800000) / 1000 }
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'u_maria',
    name: 'Maria Clara De Los Santos',
    firstName: 'Maria Clara',
    lastName: 'De Los Santos',
    middleName: 'Magsalin',
    suffix: '',
    role: Role.CITIZEN,
    email: 'maria.clara@email.com',
    birthDate: '1988-12-25',
    birthPlace: 'Manila',
    sex: 'Female',
    civilStatus: 'Single',
    citizenship: 'Filipino',
    address: '123 G. Aglipay St, San Juan',
    pwdIdNumber: 'GGG-13-7405-00-0001',
    pwdIdIssueDate: '2024-03-20',
    pwdIdExpiryDate: getRelativeDate(365 * 3),
    avatarUrl: FEMALE_AVATAR,
    contactNumber: '0917 777 8888',
    username: 'maria',
    password: 'asd',
    livingArrangement: 'Owned',
    disabilityType: 'Visual Impairment',
    causeOfDisability: 'Congenital',
    registrationDate: '2024-01-10',
    dateApplied: '2024-01-05',
    employmentStatus: 'Employed',
    employmentType: 'Private',
    occupation: 'Software Developer',
    isDeceased: false
  },
  {
    id: 'u_dummy',
    name: 'Juan Dela Cruz',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    middleName: 'Santos',
    suffix: 'Jr.',
    role: Role.CITIZEN,
    email: 'juan@email.com',
    birthDate: '1995-03-15',
    birthPlace: 'San Juan City',
    sex: 'Male',
    civilStatus: 'Married',
    citizenship: 'Filipino',
    address: '155 F. Blumentritt, San Juan',
    streetAddress: '155 F. Blumentritt',
    barangay: 'Addition Hills',
    cityMunicipality: 'San Juan City',
    province: 'Metro Manila',
    region: 'NCR',
    pwdIdNumber: 'GGG-13-7405-00-0002',
    pwdIdIssueDate: '2024-01-15',
    pwdIdExpiryDate: '2027-01-15',
    avatarUrl: MALE_AVATAR,
    contactNumber: '0917 000 0000',
    mobileNumber: '0917 000 0000',
    emailAddress: 'juan@email.com',
    emergencyContactPerson: 'Maria Dela Cruz',
    emergencyContactNumber: '0917 111 1111',
    emergencyContactRelationship: 'Spouse',
    username: 'juan',
    password: 'asd',
    disabilityType: 'Orthopedic Disability',
    causeOfDisability: 'Acquired',
    registrationDate: '2024-01-15',
    dateApplied: '2024-01-10',
    employmentStatus: 'Self-Employed',
    employmentType: 'Business Owner',
    occupation: 'Shop Owner',
    isDeceased: false
  },
  {
    id: 'u_pedro',
    name: 'Pedro Penduko',
    firstName: 'Pedro',
    lastName: 'Penduko',
    middleName: 'A.',
    role: Role.CITIZEN,
    email: 'pedro@email.com',
    birthDate: '1990-05-10',
    sex: 'Male',
    address: '789 N. Domingo St, San Juan',
    pwdIdNumber: 'GGG-13-7405-00-0003',
    pwdIdIssueDate: '2024-05-10',
    pwdIdExpiryDate: '2027-05-10',
    avatarUrl: MALE_AVATAR,
    contactNumber: '0917 222 3333',
    username: 'pedro',
    password: 'asd',
    disabilityType: 'Hearing Impairment',
    registrationDate: '2024-05-10',
    isDeceased: false
  },
  {
    id: 'u_eligible_1',
    name: 'Antonio Luna',
    firstName: 'Antonio',
    lastName: 'Luna',
    role: Role.CITIZEN,
    email: 'antonio@email.com',
    birthDate: '1960-10-29',
    sex: 'Male',
    address: '123 H. Lozada, San Juan',
    pwdIdNumber: 'GGG-13-7405-00-0010',
    pwdIdIssueDate: '2023-06-15',
    pwdIdExpiryDate: '2026-06-15',
    avatarUrl: MALE_AVATAR,
    username: 'antonio',
    password: 'asd',
    disabilityType: 'Physical Disability',
    registrationDate: '2023-06-15',
    isDeceased: false
  },
  {
    id: 'u_eligible_2',
    name: 'Melchora Aquino',
    firstName: 'Melchora',
    lastName: 'Aquino',
    role: Role.CITIZEN,
    email: 'tandang.sora@email.com',
    birthDate: '1955-01-06',
    sex: 'Female',
    address: '456 Banahaw St, San Juan',
    pwdIdNumber: 'GGG-13-7405-00-0011',
    pwdIdIssueDate: '2023-08-20',
    pwdIdExpiryDate: '2026-08-20',
    avatarUrl: FEMALE_AVATAR,
    username: 'melchora',
    password: 'asd',
    disabilityType: 'Visual Impairment',
    registrationDate: '2023-08-20',
    isDeceased: false
  },
  {
    id: 'u_not_eligible_new',
    name: 'Jose Rizal',
    firstName: 'Jose',
    lastName: 'Rizal',
    role: Role.CITIZEN,
    email: 'pepe@email.com',
    birthDate: '1961-06-19',
    sex: 'Male',
    address: '789 Jose Rizal St, San Juan',
    pwdIdNumber: 'GGG-13-7405-00-0012',
    pwdIdIssueDate: '2026-02-01',
    pwdIdExpiryDate: '2029-02-01',
    avatarUrl: MALE_AVATAR,
    username: 'jose',
    password: 'asd',
    disabilityType: 'Learning Disability',
    registrationDate: '2026-02-01',
    isDeceased: false
  },
  {
    id: 'u_not_eligible_deceased',
    name: 'Apolinario Mabini',
    firstName: 'Apolinario',
    lastName: 'Mabini',
    role: Role.CITIZEN,
    email: 'mabini@email.com',
    birthDate: '1960-07-23',
    sex: 'Male',
    address: '101 Mabini St, San Juan',
    pwdIdNumber: 'GGG-13-7405-00-0013',
    pwdIdIssueDate: '2023-01-01',
    pwdIdExpiryDate: '2026-01-01',
    avatarUrl: MALE_AVATAR,
    username: 'apolinario',
    password: 'asd',
    disabilityType: 'Orthopedic Disability',
    registrationDate: '2023-01-01',
    isDeceased: true
  },
  {
    id: 'a1',
    name: 'PWD Admin Officer',
    role: Role.ADMIN,
    email: 'admin@gov.ph',
    avatarUrl: 'https://www.phoenix.com.ph/wp-content/uploads/2026/03/Group-260-e1773292822209.png',
    username: 'admin',
    password: 'asd'
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app_1',
    userId: 'u_pedro',
    userName: 'Pedro Penduko',
    type: ApplicationType.REGISTRATION,
    date: getRelativeDate(-5),
    status: ApplicationStatus.PENDING,
    description: 'New PWD Registration Request',
    formData: {
      firstName: 'Pedro',
      middleName: 'A.',
      lastName: 'Penduko',
      suffix: '',
      birthDate: '1990-05-10',
      birthPlace: 'Manila',
      sex: 'Male',
      citizenship: 'Filipino',
      civilStatus: 'Single',
      address: '789 N. Domingo St, San Juan',
      contactNumber: '09123456789',
      emergencyContactPerson: 'Juan Penduko',
      emergencyContactNumber: '09987654321',
      joinFederation: true,
      disabilityType: 'Hearing Impairment'
    }
  },
  {
    id: 'app_2',
    userId: 'u_maria',
    userName: 'Maria Clara De Los Santos',
    type: ApplicationType.BENEFIT_CASH,
    date: getRelativeDate(-2),
    status: ApplicationStatus.APPROVED,
    description: 'Financial Assistance for Medical Supplies'
  },
  {
    id: 'app_3',
    userId: 'u_dummy',
    userName: 'Juan Dela Cruz',
    type: ApplicationType.ID_RENEWAL,
    date: getRelativeDate(-10),
    status: ApplicationStatus.ISSUED,
    description: 'PWD ID Card Renewal'
  },
  {
    id: 'app_5',
    userId: 'u_maria',
    userName: 'Maria Clara De Los Santos',
    type: ApplicationType.ID_NEW,
    date: getRelativeDate(-3),
    status: ApplicationStatus.REJECTED,
    description: 'New ID Application',
    rejectionReason: 'Incomplete documents: Missing medical certificate.'
  },
  {
    id: 'app_6',
    userId: 'u_dummy',
    userName: 'Juan Dela Cruz',
    type: ApplicationType.BENEFIT_CASH,
    date: getRelativeDate(-7),
    status: ApplicationStatus.APPROVED,
    description: 'Cash Grant for Medical Supplies'
  },
  {
    id: 'app_7',
    userId: 'u_pedro',
    userName: 'Pedro Penduko',
    type: ApplicationType.ID_REPLACEMENT,
    date: getRelativeDate(-12),
    status: ApplicationStatus.PENDING,
    description: 'Lost ID Replacement'
  },
  {
    id: 'app_8',
    userId: 'u_clarissa',
    userName: 'Clarissa Magsalin',
    type: ApplicationType.REGISTRATION,
    date: getRelativeDate(-2),
    status: ApplicationStatus.CLARIFICATION,
    description: 'Registration for Clarification',
    formData: {
      firstName: 'Clarissa',
      middleName: '',
      lastName: 'Magsalin',
      suffix: '',
      birthDate: '1998-01-01',
      birthPlace: 'Manila',
      sex: 'Female',
      citizenship: 'Filipino',
      civilStatus: 'Single',
      address: '123 Batis St, San Juan',
      contactNumber: '09123456789',
      emergencyContactPerson: 'Maria Clara',
      emergencyContactNumber: '09177778888',
      joinFederation: false,
      disabilityType: 'Visual Impairment'
    }
  },
  {
    id: 'app_9',
    userId: 'u_ricardo',
    userName: 'Ricardo Dalisay',
    type: ApplicationType.REGISTRATION,
    date: getRelativeDate(-1),
    status: ApplicationStatus.PENDING,
    description: 'New PWD Registration',
    formData: {
      firstName: 'Ricardo',
      middleName: '',
      lastName: 'Dalisay',
      suffix: '',
      birthDate: '1985-03-15',
      birthPlace: 'Manila',
      sex: 'Male',
      citizenship: 'Filipino',
      civilStatus: 'Married',
      address: '155 F. Blumentritt, San Juan',
      contactNumber: '09177779999',
      emergencyContactPerson: 'Cardo Dalisay',
      emergencyContactNumber: '09170000000',
      joinFederation: true,
      disabilityType: 'Physical Disability'
    }
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'c1',
    userId: 'u_dummy',
    userName: 'Juan Dela Cruz',
    date: '2024-10-15',
    subject: 'Accessibility Ramp Inquiry',
    details: 'I would like to inquire about the installation of accessibility ramps in our local barangay hall.',
    status: 'Open',
  },
  {
    id: 'c2',
    userId: 'u_maria',
    userName: 'Maria Clara De Los Santos',
    date: getRelativeDate(-3),
    subject: 'ID Delivery Delay',
    details: 'My ID was approved two weeks ago but I have not received it yet.',
    status: 'Open',
  },
  {
    id: 'f1',
    userId: 'u_pedro',
    userName: 'Pedro Penduko',
    date: getRelativeDate(-1),
    subject: '[Feedback] Great Service!',
    details: 'The staff at the PWD office were very helpful and efficient. Thank you!',
    status: 'Resolved',
  },
  {
    id: 'f2',
    userId: 'u_clarissa',
    userName: 'Clarissa Magsalin',
    date: getRelativeDate(-5),
    subject: '[Feedback] Website Suggestion',
    details: 'It would be great if we could track the exact delivery status of our IDs on the website.',
    status: 'Open',
  }
];

export const INITIAL_REGISTRY_RECORDS: RegistryRecord[] = [
  { 
    id: 'LCR-2024-001', 
    type: 'LCR', 
    firstName: 'Ricardo', 
    middleName: 'Geronimo',
    lastName: 'Dalisay', 
    suffix: '',
    citizenship: 'Filipino',
    birthDate: '1985-03-15', 
    birthPlace: 'Baguio City',
    sex: 'Male',
    civilStatus: 'Married',
    city: 'San Juan City',
    province: 'Metro Manila',
    district: 'District 1',
    barangay: 'Addition Hills',
    street: 'F. Blumentritt',
    houseNo: '155',
    isRegistered: false 
  },
  { 
    id: 'LCR-2024-002', 
    type: 'LCR', 
    firstName: 'Andres', 
    middleName: 'B.',
    lastName: 'Bonifacio', 
    suffix: '',
    citizenship: 'Filipino',
    birthDate: '1992-11-30', 
    birthPlace: 'Tondo, Manila',
    sex: 'Male',
    civilStatus: 'Single',
    city: 'San Juan City',
    province: 'Metro Manila',
    district: 'District 2',
    barangay: 'Little Baguio',
    isRegistered: false 
  },
  { 
    id: 'GGG-13-7405-00-0006', 
    type: 'PWD', 
    firstName: 'Leonora', 
    middleName: 'Agoncillo',
    lastName: 'Rivera', 
    suffix: '',
    citizenship: 'Filipino',
    birthDate: '1990-08-20', 
    birthPlace: 'Calamba, Laguna',
    sex: 'Female',
    civilStatus: 'Single',
    city: 'San Juan City',
    province: 'Metro Manila',
    district: 'District 1',
    barangay: 'Tibagan',
    street: 'N. Domingo St',
    houseNo: '22',
    isRegistered: true 
  },
  { 
    id: 'GGG-13-7405-00-0007', 
    type: 'PWD', 
    firstName: 'Jose', 
    middleName: 'P.',
    lastName: 'Rizal', 
    suffix: '',
    citizenship: 'Filipino',
    birthDate: '1980-06-19', 
    birthPlace: 'Calamba, Laguna',
    sex: 'Male',
    civilStatus: 'Single',
    city: 'San Juan City',
    province: 'Metro Manila',
    district: 'District 1',
    barangay: 'Onse',
    isRegistered: true 
  },
  { 
    id: 'LCR-2024-003', 
    type: 'LCR', 
    firstName: 'Melchora', 
    middleName: 'A.',
    lastName: 'Aquino', 
    suffix: '',
    citizenship: 'Filipino',
    birthDate: '1812-01-06', 
    birthPlace: 'Balintawak',
    sex: 'Female',
    civilStatus: 'Widow',
    city: 'San Juan City',
    province: 'Metro Manila',
    district: 'District 1',
    barangay: 'Salapan',
    isRegistered: false,
    isDeceased: true
  },
  { 
    id: 'LCR-2024-004', 
    type: 'LCR', 
    firstName: 'Emilio', 
    middleName: 'F.',
    lastName: 'Aguinaldo', 
    suffix: '',
    citizenship: 'Filipino',
    birthDate: '1869-03-22', 
    birthPlace: 'Kawit, Cavite',
    sex: 'Male',
    civilStatus: 'Married',
    city: 'San Juan City',
    province: 'Metro Manila',
    district: 'District 2',
    barangay: 'Greenhills',
    isRegistered: false,
    isSenior: true
  },
  { 
    id: 'LCR-2024-005', 
    type: 'LCR', 
    firstName: 'Apolinario', 
    middleName: 'M.',
    lastName: 'Mabini', 
    suffix: '',
    citizenship: 'Filipino',
    birthDate: '1960-07-23', 
    birthPlace: 'Tanauan, Batangas',
    sex: 'Male',
    civilStatus: 'Single',
    city: 'San Juan City',
    province: 'Metro Manila',
    district: 'District 1',
    barangay: 'Kabayanan',
    isRegistered: false
  }
];

export const INITIAL_CASH_GRANTS: CashGrant[] = [
  {
    id: 'cg_2026_1',
    userId: 'u_eligible_1',
    userName: 'Antonio Luna',
    year: 2026,
    amount: 3000,
    status: CashGrantStatus.CLAIMED,
    dateGenerated: '2026-01-01T08:00:00Z',
    dateUpdated: '2026-01-15T10:00:00Z'
  },
  {
    id: 'cg_2026_2',
    userId: 'u_eligible_2',
    userName: 'Melchora Aquino',
    year: 2026,
    amount: 3000,
    status: CashGrantStatus.UNCLAIMED,
    dateGenerated: '2026-01-01T08:00:00Z',
    dateUpdated: '2026-01-20T14:30:00Z'
  }
];


