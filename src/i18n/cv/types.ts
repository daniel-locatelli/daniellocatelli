export type I18nCV = {
  ui: {
    title: string,
    summary: string,
    skills: string,
    programming: string,
    frameworks: string,
    databases: string,
    designTools: string,
    specialization: string,
    languages: string,
    professionalExperience: string,
    education: string,
    scholarships: string,
    publications: string,
    certifications: string,
    tutoring: string,
    coursesAndTalks: string,
    coursesAttended: string,
    projectsList: string,
    // Other elements
    current: string,
  },
  quote: string;
  summary: string;
  skillsProgramming: Skill[];
  skillsFrameworks: Skill[];
  skillsDatabases: Skill[];
  skillsDesign: Skill[]; // check what this realy is
  skillsSpecialized: string[];
  skillsLanguages: Skill[];
  experiences: Experience[];
  education: Education[];
  scholarships: Scholarship[];
  publications: Publication[]; // this is also addin persons
  certifications: Certification[];
  tutorships: Tutorship[]; // how is this different from talks and lectures?
  talksAndLectures: TalkAndLecture[];
  coursesAttended: CourseAttended[];
  works: Work[];
};
  
export type Skill = {
  title: string;
  description?: string;
  level: string;
  link?: string;
};

export type Experience = {
  title: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  link: string;
  titleNote?: string;
  company: string;
  companyNote?: string;
  location: string;
  items: string[];
};

export type Education = {
  title: string;
  description?: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  link: string;
  institution: string;
  location: string;
  supervisors?: string[];
  tutors?: string[];
};

export type Scholarship = {
  title: string;
  description?: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  link: string;
  institution: string;
  location: string;
};

export type Publication = {
  title: string;
  description?: string;
  date: string; // ISO date string
  link: string;
  publisher: string;
  authors: string[];
  location?: string;
};

export type Certification = {
  title: string;
  description?: string;
  date: string; // ISO date string
  validUntil?: string; // ISO date string
  credentialID?: string;
  link?: string;
  issuer: string;
};

export type Tutorship = {
  title: string;
  description?: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  link?: string;
  organization: string;
  location?: string;
};

export type TalkAndLecture = {
  title: string;
  description?: string;
  date: string; // ISO date string
  link: string;
  organization: string;
  location?: string;
};

export type CourseAttended = {
  title: string;
  description?: string;
  instructor: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  link?: string;
  organization?: string;
  location?: string;
};

export type Work = {
  title: string;
  description?: string;
  company: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  link?: string;
  location?: string;
  category?: string;
};