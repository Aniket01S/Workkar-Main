export const INITIAL_SERVICES = [
  { id: "electrician", name: "Electrician", description: "Wiring, repairs, lighting installations", icon: "electrical_services", color: "primary", bg: "bg-primary-fixed" },
  { id: "plumber", name: "Plumber", description: "Pipes, leaks, drainage solutions", icon: "plumbing", color: "secondary", bg: "bg-secondary-fixed" },
  { id: "mason", name: "Mason", description: "Brickwork, concrete, stone paving", icon: "architecture", color: "tertiary", bg: "bg-tertiary-fixed" },
  { id: "painter", name: "Painter", description: "Interior, exterior wall painting", icon: "format_paint", color: "primary", bg: "bg-primary-fixed" },
  { id: "carpenter", name: "Carpenter", description: "Woodwork, furniture repair, cabinets", icon: "handyman", color: "secondary", bg: "bg-secondary-fixed" },
  { id: "cleaner", name: "Cleaner", description: "House cleaning, deep sanitization", icon: "cleaning_services", color: "tertiary", bg: "bg-tertiary-fixed" },
  { id: "welder", name: "Welder", description: "Metal fabrication, welding repair", icon: "hardware", color: "primary", bg: "bg-primary-fixed" },
  { id: "gardener", name: "Gardener", description: "Lawn care, tree pruning, landscaping", icon: "grass", color: "secondary", bg: "bg-secondary-fixed" }
];

export const INITIAL_WORKERS = [
  {
    id: "marcus-johnson",
    name: "Marcus Johnson",
    skill: "Carpenter",
    skillTitle: "Master Carpenter",
    experience: 8,
    rating: 4.9,
    rate: 28,
    availability: "Available",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCR8cl_nJ_jKN5lGqYhv_Kksvll5ZjyQHLZxai281yM2GGn6aqAlZE6O5HSUuY_v-ALq1FNoT_3vy-vpW9hw87tEfAsbSnbXKfnV4iJOe8jxpJZmZqMUDApeD9eQSI7uuyCzhkq6qY0Pahi5GZLgpXnOwVpYQu2IqUCblgtCpG791lqEQqrntIC4f8fQ3PKYecYlQO049Q8lUHt8oVftZxbwFpgex7WX5nvkEUUXo4lhGOanpvspUCVfxk6vBkkoZ6u6_onz6wcG7_i",
    verified: true,
    reviews: [
      { id: 1, user: "Elena P.", rating: 5, date: "2 days ago", comment: "Marcus did an excellent job building our bookshelf. Fast, neat, and highly professional!" },
      { id: 2, user: "Robert S.", rating: 4.8, date: "1 week ago", comment: "Very precise woodworking. Arrived on time and worked cleanly." }
    ],
    description: "Marcus is an experienced master carpenter specializing in solid wood furniture, custom shelving, cabinet installation, and repair work. He holds a craftsmanship license and has worked with residential clients for over 8 years."
  },
  {
    id: "sarah-davis",
    name: "Sarah Davis",
    skill: "Plumber",
    skillTitle: "Licensed Plumber",
    experience: 12,
    rating: 4.8,
    rate: 32,
    availability: "On Job",
    textAvatar: "SD",
    verified: true,
    reviews: [
      { id: 1, user: "David K.", rating: 5, date: "3 days ago", comment: "Resolved a complex bathroom leak that others couldn't diagnose. Worth every penny." },
      { id: 2, user: "Maria G.", rating: 4.6, date: "2 weeks ago", comment: "Highly efficient. Changed the kitchen sink fixtures quickly." }
    ],
    description: "Sarah is a certified master plumber with 12 years of hands-on experience in residential drainage, emergency pipe repairs, water heater maintenance, and fixture installations. Reliable, swift, and highly skilled."
  },
  {
    id: "elena-rodriguez",
    name: "Elena Rodriguez",
    skill: "Electrician",
    skillTitle: "Certified Electrician",
    experience: 5,
    rating: 4.7,
    rate: 25,
    availability: "Offline",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAaZxGhoyoXOE3BFe-KVneP0ehPXoJqnYUb0X8tpOETpLqHCX2TSWaGBZpBwYrWx7MQNnP8M_d-yiJejLrIfzAAjkHwGJz38auU8Z5ngqwC7KyFHRNzpkwoumHbWhn7IwGZsCp_u1JKfVg08IE1674eZdj3Gce2Q4NF04FxWnXmDLl6sPz1HFjDdlpSywF3mLAlyxwx4Nzj54bGYkmTQeH6KRpMMs14XT_0b_WF8a2LMVlPgALT6fy-cAe6b8b-ZLMnsx6eBIDYjOhz",
    verified: true,
    reviews: [
      { id: 1, user: "Thomas L.", rating: 4.5, date: "1 month ago", comment: "Rewired our kitchen safely. Very professional approach." }
    ],
    description: "Elena has spent 5 years dealing with domestic electrical frameworks. Her services cover circuit breakers, smart lighting layouts, generator setups, and socket repairs, matching state safety regulations."
  },
  {
    id: "john-doe",
    name: "John Doe",
    skill: "Electrician",
    skillTitle: "Master Electrician",
    experience: 5,
    rating: 4.9,
    rate: 25,
    availability: "Available",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAyn73H76ZJdgf-yj3fNGxZfN8Yv-MwnQvLCa_Wp1YS1iT6I-vuqHzLgIw2dyq32whs2h6T8P3wzoMOjSPPcf7jYKwIeXjPDf_cvSokBpfXJ-nQGdRVgJmzahT_J3heHCJoxOMGYaXEcEIjxNp_nzXe8e3zc0SVtywWlde9Ijuq0rD8FVXHAYfugHJslXgLdZ5-Wh8rLBG0LNa0bgwIX5M8uuf84AKZEuuMUMmpOPu-L6l1874CjJLCrKFDPApeC-bCOYPAD6KFLT5B",
    verified: true,
    reviews: [
      { id: 1, user: "Jane W.", rating: 5, date: "5 days ago", comment: "Outstanding service. John fixed our short circuit issue in less than an hour!" }
    ],
    description: "John is a highly requested electrical specialist in residential and commercial wiring, panels upgrades, lighting layouts, and diagnostic testing. Known for fast and clean service."
  },
  {
    id: "sarah-smith",
    name: "Sarah Smith",
    skill: "Cleaner",
    skillTitle: "Professional Cleaner",
    experience: 3,
    rating: 4.8,
    rate: 18,
    availability: "Available",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB5pLhzRNr-IsNCpifIhzKh9hoLcfNP2f2W1M3N6YwZNEPlDfuegsAqgUDjqlTJZA30vHABl9E-icKEy1ST-wcWQZERN9Bc0H5Lmt4U7nIwUyFHpmZhCZK8ieoooH9QV_XJYJYch-w4zHuTn1aAYWV6mFHgIA38KTCnV0qwbzM04OHJ4G23MnF14Z-XSJZ67PF0l7A8Qb_ARXZG8OCUQjlYAi4RRNWgQQtUdSreHEyzdxSDgIJW6yZc5C2g0pMueMJRIRvBBX1kxrtl",
    verified: true,
    reviews: [
      { id: 1, user: "Arthur M.", rating: 4.8, date: "2 weeks ago", comment: "Very thorough deep cleaning. The apartment was spotless." }
    ],
    description: "Sarah provides residential and commercial sanitization, window washing, and post-renovation cleanup. She uses eco-friendly agents and works with extreme attention to detail."
  },
  {
    id: "mike-johnson",
    name: "Mike Johnson",
    skill: "Mason",
    skillTitle: "Expert Mason",
    experience: 10,
    rating: 5.0,
    rate: 30,
    availability: "Available",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZEYKUl9uuIAKpxiR691eEOWU9TzPKfxs5sx9vwlkdw7jazKOeHHSuF3soFZSkN8twHfxzGqy2vt7v7dnX9pKQ62Va5oOwn-l-yb0Aocne2H6mwc3PvMFcn4PydkdcbEi7kh1XbWFjNGrtNmY7TlYQ8Lev5Ro6s9GwPxDpxKtamXMeFAc8Bc2mEOqmvfegYLwy2WJ_g2hsq2ayNEVNreZpHLHm8ssyVuJ4uxL2yKJp_nintMIkUiuh12mRpZSvO0Ctn3KNwZqMG3qz",
    verified: true,
    reviews: [
      { id: 1, user: "Gary T.", rating: 5, date: "4 days ago", comment: "Flawless paving of our front driveway. Strong structural build!" }
    ],
    description: "Mike is a structural brickwork and stone professional. With 10 years in masonry, he builds retaining walls, block layouts, outdoor fireplaces, and performs stucco restorations."
  },
  {
    id: "kevin-turner",
    name: "Kevin Turner",
    skill: "Gardener",
    skillTitle: "Gen. Laborer & Gardener",
    experience: 2,
    rating: 4.5,
    rate: 15,
    availability: "Available",
    textAvatar: "KT",
    verified: false,
    reviews: [
      { id: 1, user: "Liza B.", rating: 4.5, date: "3 weeks ago", comment: "Very helpful in clearing the backyard weeds. Good energy." }
    ],
    description: "Kevin offers general property maintenance, weeding, basic landscaping, lawn mowing, and support with bulk lifting. High energy, friendly, and hardworking."
  }
];

export const INITIAL_JOBS_TIMELINE = [
  { step: 1, label: "Job Accepted", description: "Today, 08:30 AM", completed: true },
  { step: 2, label: "Heading to Customer", description: "Estimated arrival: 09:15 AM", completed: true },
  { step: 3, label: "Start Service", description: "Pending arrival", completed: false },
  { step: 4, label: "Job Completed", description: "Pending service completion", completed: false }
];

export const INITIAL_EARNINGS_TREND = [
  { day: "Mon", jobs: 85, tips: 15, completed: 45, trend: 35 },
  { day: "Tue", jobs: 120, tips: 25, completed: 52, trend: 45 },
  { day: "Wed", jobs: 90, tips: 20, completed: 38, trend: 30 },
  { day: "Thu", jobs: 110, tips: 30, completed: 65, trend: 55 },
  { day: "Fri", jobs: 150, tips: 45, completed: 59, trend: 50 },
  { day: "Sat", jobs: 210, tips: 60, completed: 80, trend: 70 },
  { day: "Sun", jobs: 80, tips: 10, completed: 72, trend: 65 }
];

export const INITIAL_PENDING_APPROVALS = [
  { id: "mike-k", name: "Mike K.", skill: "Carpentry", time: "1 day ago", avatarInitials: "MK" }
];

export const INITIAL_ASSIGNMENTS = [
  { id: "job-1", title: "Emergency Pipe Repair", worker: "John D.", type: "Plumbing", status: "Active", icon: "build" },
  { id: "job-2", title: "Wiring Installation", worker: "Sarah M.", type: "Electrical", status: "Pending", icon: "electrical_services" },
  { id: "job-3", title: "Deep Cleaning", worker: "Lisa R.", type: "Cleaning", status: "Completed", icon: "cleaning_services" }
];
