const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { connectDB } = require('../config/db');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const Feedback = require('../models/Feedback');
const Certificate = require('../models/Certificate');
const Announcement = require('../models/Announcement');
const { generateSecureToken, generateQRDataUrl } = require('../services/qrService');

const seedAll = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({}),
      Ticket.deleteMany({}),
      Notification.deleteMany({}),
      Feedback.deleteMany({}),
      Certificate.deleteMany({}),
      Announcement.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo users...');
    // 1. Admin
    const adminUser = await User.create({
      name: 'Alex Rivera',
      email: 'admin@eventx.com',
      password: 'Admin@123',
      role: 'admin',
      department: 'Platform Operations',
      college: 'EventX HQ',
      phone: '+1 (555) 019-2834',
      interests: ['AI', 'Infrastructure', 'Platform Governance'],
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    });

    // 2. Organizer
    const organizerUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'organizer@eventx.com',
      password: 'Organizer@123',
      role: 'organizer',
      department: 'Computer Science & Engineering',
      college: 'Apex Institute of Technology',
      phone: '+1 (555) 234-5678',
      interests: ['Hackathons', 'Cloud Computing', 'AI Workshops'],
      profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    });

    // 3. Student (Primary)
    const studentUser = await User.create({
      name: 'Devon Vance',
      email: 'student@eventx.com',
      password: 'Student@123',
      role: 'student',
      department: 'Software Engineering',
      college: 'Apex Institute of Technology',
      phone: '+1 (555) 345-6789',
      interests: ['Web Development', 'AI', 'UI/UX Design', 'Hackathons'],
      profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
    });

    // 4. Secondary Student
    const student2 = await User.create({
      name: 'Maya Chen',
      email: 'maya@eventx.com',
      password: 'Student@123',
      role: 'student',
      department: 'Data Science',
      college: 'Apex Institute of Technology',
      phone: '+1 (555) 456-7890',
      interests: ['Machine Learning', 'Data Visualization', 'Ethics in Tech'],
      profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    });

    console.log('[Seed] Users created successfully.');

    // Dates for realistic schedule
    const now = new Date();
    const futureDate = (daysAhead, hours = 10) => {
      const d = new Date(now);
      d.setDate(d.getDate() + daysAhead);
      d.setHours(hours, 0, 0, 0);
      return d;
    };

    const pastDate = (daysAgo, hours = 14) => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      d.setHours(hours, 0, 0, 0);
      return d;
    };

    console.log('[Seed] Creating demo events...');
    // Event 1: AI Summit (Past - with attended check-in and certificate)
    const event1 = await Event.create({
      title: 'Apex AI & Machine Learning Summit 2026',
      shortDescription: 'Keynotes, breakout workshops, and hands-on LLM engineering sessions with leading researchers.',
      description: `Join us for the premier academic and industry summit focused on generative AI, neural architecture, and applied computer vision.

Attendees will interact with distinguished researchers from premier AI labs, dive deep into reinforcement learning, fine-tuning open-weights models, and optimizing tensor inference at scale.

Key Takeaways:
- Real-time LLM inference optimization techniques
- Building autonomous agentic workflows
- Ethical alignment and bias mitigation in neural models
- Hands-on hack lab with GPU compute provided`,
      category: 'Technical',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
      organizer: organizerUser._id,
      startDate: pastDate(7, 9),
      endDate: pastDate(7, 18),
      venue: 'Main Auditorium, Tech Block B',
      capacity: 120,
      registeredCount: 88,
      waitlistCount: 0,
      registrationDeadline: pastDate(10),
      status: 'approved',
      isFeatured: true,
      priceType: 'free',
      price: 0,
      tags: ['AI', 'Deep Learning', 'PyTorch', 'LLMs'],
      agenda: [
        { time: '09:00 AM', session: 'Registration & Welcome Keynote', speaker: 'Dr. Evelyn Ward' },
        { time: '11:00 AM', session: 'Scaling Multimodal Architectures', speaker: 'Vikram Joshi, Lead AI Scientist' },
        { time: '02:00 PM', session: 'Hands-on Model Fine-tuning Lab', speaker: 'Sarah Jenkins' },
        { time: '05:00 PM', session: 'Panel: Future of Agentic Automation', speaker: 'Industry Guest Panel' },
      ],
      contactEmail: 'summit@apexai.edu',
      contactPhone: '+1 (555) 901-2345',
    });

    // Event 2: HackNova (Upcoming - confirmed with digital ticket)
    const event2 = await Event.create({
      title: 'HackNova: 36-Hour National Hackathon',
      shortDescription: 'Build next-gen solutions in Web3, AI, and Sustainability. $10,000 in bounties.',
      description: `HackNova brings together over 400 passionate software architects, designers, and domain specialists for 36 hours of non-stop innovation.

Compete across four flagship tracks:
1. Autonomous AI & Agents
2. Smart Cities & Clean Energy
3. Next-Gen Financial Infrastructure
4. Healthcare & Assistive Tech

Free food, swags, caffeine, high-speed fiber internet, and mentorship from top industry founders throughout the weekend.`,
      category: 'Hackathon',
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200',
      organizer: organizerUser._id,
      startDate: futureDate(5, 10),
      endDate: futureDate(7, 18),
      venue: 'Innovation Innovation Complex, Hall 3',
      capacity: 150,
      registeredCount: 132,
      waitlistCount: 4,
      registrationDeadline: futureDate(3, 23),
      status: 'approved',
      isFeatured: true,
      priceType: 'free',
      price: 0,
      tags: ['Hackathon', 'React', 'FullStack', 'Bounties'],
      agenda: [
        { time: 'Day 1 - 10:00 AM', session: 'Opening Ceremony & Team Pitching', speaker: 'Organizing Committee' },
        { time: 'Day 1 - 12:00 PM', session: 'Hacking Commences & Mentor Matching', speaker: 'Mentors' },
        { time: 'Day 2 - 10:00 PM', session: 'Code Freeze & Project Submission', speaker: 'All Teams' },
        { time: 'Day 3 - 02:00 PM', session: 'Top 10 Live Demos & Award Gala', speaker: 'Judging Panel' },
      ],
      contactEmail: 'contact@hacknova.io',
      contactPhone: '+1 (555) 789-0123',
    });

    // Event 3: Full-Stack Cloud Architecture Workshop
    const event3 = await Event.create({
      title: 'Modern Full-Stack Cloud Architecture Workshop',
      shortDescription: 'Master microservices, distributed systems, container orchestration, and serverless architectures.',
      description: `An intensive, hands-on masterclass for engineering students and aspiring systems architects looking to transition from basic monoliths to resilient cloud-native microservices.

Topics covered:
- Docker containerization and Kubernetes cluster management
- Message queuing with Apache Kafka & RabbitMQ
- Zero-trust authentication and microservice security
- Database sharding, replica sets, and Redis caching layers`,
      category: 'Workshop',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
      organizer: organizerUser._id,
      startDate: futureDate(12, 14),
      endDate: futureDate(12, 19),
      venue: 'Computing Lab 4 & Virtual Stream',
      isOnline: true,
      meetingLink: 'https://meet.eventx.com/cloud-arch-2026',
      capacity: 80,
      registeredCount: 54,
      waitlistCount: 0,
      registrationDeadline: futureDate(10),
      status: 'approved',
      isFeatured: false,
      priceType: 'free',
      price: 0,
      tags: ['Cloud', 'Docker', 'Kubernetes', 'Microservices'],
      contactEmail: 'workshops@apex.edu',
    });

    // Event 4: Global Tech UX & Product Design Conference
    const event4 = await Event.create({
      title: 'Global Tech UX & Product Design Conference',
      shortDescription: 'Design systems, micro-interactions, accessibility audits, and design leadership.',
      description: `A gathering of interface designers, product managers, and frontend craftspeople exploring modern design systems, spatial computing UI, and cognitive accessibility.

Learn how world-class product teams design at companies like Linear, Figma, and Stripe. Discover best practices for fluid typography, dark mode contrast compliance, and micro-interactions.`,
      category: 'Conference',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
      organizer: organizerUser._id,
      startDate: futureDate(20, 9),
      endDate: futureDate(21, 17),
      venue: 'Saraswati Convention Center',
      capacity: 250,
      registeredCount: 198,
      waitlistCount: 0,
      registrationDeadline: futureDate(18),
      status: 'approved',
      isFeatured: true,
      priceType: 'free',
      price: 0,
      tags: ['Design', 'UI/UX', 'Figma', 'Product'],
      contactEmail: 'design@eventx.com',
    });

    // Event 5: Rhythm & Lights Gala
    const event5 = await Event.create({
      title: 'Rhythm & Lights: Annual Inter-College Cultural Gala',
      shortDescription: 'Music performances, theatrical drama, battle of the bands, and art exhibitions.',
      description: `The flagship cultural event of the year! Experience dynamic musical bands, street dance battles, theatrical plays, and culinary stalls curated by student clubs from across 40 universities.`,
      category: 'Cultural',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200',
      organizer: organizerUser._id,
      startDate: futureDate(28, 17),
      endDate: futureDate(29, 23),
      venue: 'University Central Grounds',
      capacity: 600,
      registeredCount: 420,
      waitlistCount: 0,
      registrationDeadline: futureDate(25),
      status: 'approved',
      isFeatured: false,
      priceType: 'free',
      price: 0,
      tags: ['Music', 'Drama', 'Dance', 'Cultural'],
      contactEmail: 'cultural@apex.edu',
    });

    // Event 6: Pending event for Admin Approval testing
    const event6 = await Event.create({
      title: 'Quantum Computing & Post-Quantum Cryptography Seminar',
      shortDescription: 'Quantum entanglement circuits, Qiskit simulations, and lattice-based cryptography standards.',
      description: `A master seminar exploring the practical implications of NISQ quantum computers on classical encryption, RSA deprecation timelines, and NIST standardized post-quantum algorithms.`,
      category: 'Seminar',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1200',
      organizer: organizerUser._id,
      startDate: futureDate(15, 11),
      endDate: futureDate(15, 15),
      venue: 'Physics Colloquium Room 102',
      capacity: 50,
      registeredCount: 0,
      waitlistCount: 0,
      registrationDeadline: futureDate(14),
      status: 'pending',
      isFeatured: false,
      priceType: 'free',
      tags: ['Quantum', 'Cryptography', 'Cybersecurity'],
      contactEmail: 'physics@apex.edu',
    });

    console.log('[Seed] Events created successfully.');

    // ----------------------------------------------------
    // Create Registrations, Tickets, Certificates for Devon (studentUser)
    // ----------------------------------------------------
    console.log('[Seed] Creating demo registrations, tickets, and certificates...');

    // 1. Devon attended Event 1 (AI Summit)
    const reg1 = await Registration.create({
      user: studentUser._id,
      event: event1._id,
      status: 'attended',
      registeredAt: pastDate(12),
      attendedAt: pastDate(7, 10),
    });

    const qrToken1 = generateSecureToken();
    const ticket1Payload = {
      ticketId: 'EVTX-98214-4192',
      qrToken: qrToken1,
      eventId: event1._id.toString(),
      eventTitle: event1.title,
      userId: studentUser._id.toString(),
      userName: studentUser.name,
    };
    const qrData1 = await generateQRDataUrl(ticket1Payload);

    const ticket1 = await Ticket.create({
      ticketId: 'EVTX-98214-4192',
      registration: reg1._id,
      event: event1._id,
      user: studentUser._id,
      qrToken: qrToken1,
      qrCodeDataUrl: qrData1,
      checkedIn: true,
      checkedInAt: pastDate(7, 10),
      checkedInBy: organizerUser._id,
    });

    // Certificate for Event 1
    const cert1 = await Certificate.create({
      certificateId: 'CERT-EVTX-2026-9A82',
      user: studentUser._id,
      event: event1._id,
      ticket: ticket1._id,
      recipientName: studentUser.name,
      eventTitle: event1.title,
      eventDate: event1.startDate,
      organizerName: organizerUser.name,
      verificationCode: 'A92F4D7B',
      issuedDate: pastDate(7, 18),
    });

    // Feedback for Event 1
    await Feedback.create({
      user: studentUser._id,
      event: event1._id,
      rating: 5,
      comment: 'Incredible summit! The live model fine-tuning lab and the GPU infrastructure were top notch. Learned a tremendous amount.',
      aspectRatings: { content: 5, organization: 5, venue: 4 },
      isAnonymous: false,
    });

    // 2. Devon confirmed for Event 2 (HackNova)
    const reg2 = await Registration.create({
      user: studentUser._id,
      event: event2._id,
      status: 'confirmed',
      registeredAt: pastDate(2),
    });

    const qrToken2 = generateSecureToken();
    const ticket2Payload = {
      ticketId: 'EVTX-84192-3021',
      qrToken: qrToken2,
      eventId: event2._id.toString(),
      eventTitle: event2.title,
      userId: studentUser._id.toString(),
      userName: studentUser.name,
    };
    const qrData2 = await generateQRDataUrl(ticket2Payload);

    await Ticket.create({
      ticketId: 'EVTX-84192-3021',
      registration: reg2._id,
      event: event2._id,
      user: studentUser._id,
      qrToken: qrToken2,
      qrCodeDataUrl: qrData2,
      checkedIn: false,
    });

    // 3. Devon registered for Event 3 (Cloud Architecture)
    const reg3 = await Registration.create({
      user: studentUser._id,
      event: event3._id,
      status: 'confirmed',
      registeredAt: pastDate(1),
    });

    const qrToken3 = generateSecureToken();
    const qrData3 = await generateQRDataUrl({
      ticketId: 'EVTX-71049-5582',
      qrToken: qrToken3,
      eventId: event3._id.toString(),
      eventTitle: event3.title,
      userId: studentUser._id.toString(),
      userName: studentUser.name,
    });

    await Ticket.create({
      ticketId: 'EVTX-71049-5582',
      registration: reg3._id,
      event: event3._id,
      user: studentUser._id,
      qrToken: qrToken3,
      qrCodeDataUrl: qrData3,
      checkedIn: false,
    });

    // Announcements for HackNova
    await Announcement.create({
      event: event2._id,
      organizer: organizerUser._id,
      title: 'Discord Server & Mentor Office Hours Schedule Live',
      message: 'Welcome HackNova participants! Please join our official Discord server before the opening ceremony on Friday. Check the announcements channel for mentor office hours.',
      priority: 'urgent',
    });

    await Announcement.create({
      event: event2._id,
      organizer: organizerUser._id,
      title: 'API Keys & Cloud Credits Released',
      message: 'All registered hackers have been credited $200 in cloud credits. Check your registered inbox for redemption vouchers.',
      priority: 'normal',
    });

    // Notifications for Devon
    await Notification.create({
      user: studentUser._id,
      title: 'Digital Ticket Ready 🎟️',
      message: 'Your admission ticket for HackNova 2026 is confirmed. Access your QR code anytime from your dashboard.',
      type: 'registration',
      link: '/my-tickets',
      createdAt: pastDate(2),
    });

    await Notification.create({
      user: studentUser._id,
      title: 'Certificate Issued! 🏆',
      message: 'Your Certificate of Participation for Apex AI & Machine Learning Summit 2026 is ready for download.',
      type: 'certificate',
      link: '/my-certificates',
      createdAt: pastDate(7),
    });

    console.log('[Seed] Database populated successfully with demo data!');
    console.log(`
=====================================================
 EVENTX DEMO ACCOUNTS CREATED:
 ---------------------------------------------------
 1. Administrator:
    Email:    admin@eventx.com
    Password: Admin@123
 2. Event Organizer:
    Email:    organizer@eventx.com
    Password: Organizer@123
 3. Student / Participant:
    Email:    student@eventx.com
    Password: Student@123
=====================================================
    `);

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding data:', error);
    process.exit(1);
  }
};

seedAll();
