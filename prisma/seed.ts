import { PrismaClient, UserRole, StudentStatus, GroupStatus, LeadStatus, PaymentStatus, AttendanceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addMonths, subMonths, startOfMonth } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Academy
  const academy = await prisma.academy.upsert({
    where: { slug: 'academia-elite' },
    update: {},
    create: {
      name: 'Academia Elite Deportiva',
      slug: 'academia-elite',
      primaryColor: '#3B82F6',
      address: 'Av. Principal 123, Ciudad',
      phone: '+1 555-0100',
      email: 'info@academiaelite.com',
    },
  });
  console.log(`✅ Academy: ${academy.name}`);

  // Admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { academyId_email: { academyId: academy.id, email: 'admin@academiaelite.com' } },
    update: {},
    create: {
      academyId: academy.id,
      email: 'admin@academiaelite.com',
      password: hashedPassword,
      name: 'Administrador Principal',
      role: UserRole.ADMIN,
    },
  });
  console.log(`✅ Admin: ${adminUser.email}`);

  // Trainers
  const trainer1 = await prisma.trainer.upsert({
    where: { id: 'trainer-1' },
    update: {},
    create: {
      id: 'trainer-1',
      academyId: academy.id,
      name: 'Carlos Mendoza',
      phone: '+1 555-0101',
      email: 'carlos@academiaelite.com',
      specialty: 'Fútbol Base',
      bio: 'Entrenador certificado UEFA B con 10 años de experiencia en formación de jóvenes futbolistas.',
    },
  });

  const trainer2 = await prisma.trainer.upsert({
    where: { id: 'trainer-2' },
    update: {},
    create: {
      id: 'trainer-2',
      academyId: academy.id,
      name: 'Laura Jiménez',
      phone: '+1 555-0102',
      email: 'laura@academiaelite.com',
      specialty: 'Natación',
      bio: 'Ex nadadora olímpica, especialista en técnica de natación para todas las edades.',
    },
  });

  const trainer3 = await prisma.trainer.upsert({
    where: { id: 'trainer-3' },
    update: {},
    create: {
      id: 'trainer-3',
      academyId: academy.id,
      name: 'Miguel Torres',
      phone: '+1 555-0103',
      email: 'miguel@academiaelite.com',
      specialty: 'Tenis',
      bio: 'Entrenador de tenis profesional con certificación ITF nivel 3.',
    },
  });
  console.log('✅ Trainers created');

  // Groups
  const group1 = await prisma.group.upsert({
    where: { id: 'group-1' },
    update: {},
    create: {
      id: 'group-1',
      academyId: academy.id,
      trainerId: trainer1.id,
      name: 'Fútbol Sub-8 Mañana',
      sportType: 'Fútbol',
      minAge: 5,
      maxAge: 8,
      capacity: 15,
      monthlyPrice: 80,
      status: GroupStatus.ACTIVE,
    },
  });

  const group2 = await prisma.group.upsert({
    where: { id: 'group-2' },
    update: {},
    create: {
      id: 'group-2',
      academyId: academy.id,
      trainerId: trainer1.id,
      name: 'Fútbol Sub-12 Tarde',
      sportType: 'Fútbol',
      minAge: 9,
      maxAge: 12,
      capacity: 18,
      monthlyPrice: 90,
      status: GroupStatus.ACTIVE,
    },
  });

  const group3 = await prisma.group.upsert({
    where: { id: 'group-3' },
    update: {},
    create: {
      id: 'group-3',
      academyId: academy.id,
      trainerId: trainer2.id,
      name: 'Natación Principiantes',
      sportType: 'Natación',
      minAge: 4,
      maxAge: 10,
      capacity: 12,
      monthlyPrice: 100,
      status: GroupStatus.ACTIVE,
    },
  });

  const group4 = await prisma.group.upsert({
    where: { id: 'group-4' },
    update: {},
    create: {
      id: 'group-4',
      academyId: academy.id,
      trainerId: trainer3.id,
      name: 'Tenis Juvenil',
      sportType: 'Tenis',
      minAge: 10,
      maxAge: 16,
      capacity: 10,
      monthlyPrice: 120,
      status: GroupStatus.ACTIVE,
    },
  });
  console.log('✅ Groups created');

  // Schedules
  await prisma.schedule.createMany({
    skipDuplicates: true,
    data: [
      { groupId: group1.id, dayOfWeek: 1, startTime: '09:00', endTime: '10:30' },
      { groupId: group1.id, dayOfWeek: 3, startTime: '09:00', endTime: '10:30' },
      { groupId: group1.id, dayOfWeek: 5, startTime: '09:00', endTime: '10:30' },
      { groupId: group2.id, dayOfWeek: 2, startTime: '16:00', endTime: '17:30' },
      { groupId: group2.id, dayOfWeek: 4, startTime: '16:00', endTime: '17:30' },
      { groupId: group3.id, dayOfWeek: 1, startTime: '10:00', endTime: '11:00' },
      { groupId: group3.id, dayOfWeek: 3, startTime: '10:00', endTime: '11:00' },
      { groupId: group3.id, dayOfWeek: 5, startTime: '10:00', endTime: '11:00' },
      { groupId: group4.id, dayOfWeek: 2, startTime: '17:00', endTime: '18:30' },
      { groupId: group4.id, dayOfWeek: 4, startTime: '17:00', endTime: '18:30' },
      { groupId: group4.id, dayOfWeek: 6, startTime: '10:00', endTime: '11:30' },
    ],
  });
  console.log('✅ Schedules created');

  // Students
  const studentsData = [
    { firstName: 'Alejandro', lastName: 'García', birthDate: new Date('2018-03-15'), parentName: 'Roberto García', parentPhone: '+1 555-1001', parentEmail: 'roberto@email.com', groupId: group1.id },
    { firstName: 'Sofía', lastName: 'Martínez', birthDate: new Date('2017-07-22'), parentName: 'Ana Martínez', parentPhone: '+1 555-1002', parentEmail: 'ana@email.com', groupId: group1.id },
    { firstName: 'Mateo', lastName: 'López', birthDate: new Date('2018-11-05'), parentName: 'Carlos López', parentPhone: '+1 555-1003', parentEmail: 'carlos.l@email.com', groupId: group1.id },
    { firstName: 'Valentina', lastName: 'Rodríguez', birthDate: new Date('2016-02-18'), parentName: 'María Rodríguez', parentPhone: '+1 555-1004', parentEmail: 'maria.r@email.com', groupId: group2.id },
    { firstName: 'Santiago', lastName: 'Hernández', birthDate: new Date('2015-09-30'), parentName: 'José Hernández', parentPhone: '+1 555-1005', parentEmail: 'jose.h@email.com', groupId: group2.id },
    { firstName: 'Isabella', lastName: 'González', birthDate: new Date('2016-06-12'), parentName: 'Laura González', parentPhone: '+1 555-1006', parentEmail: 'laura.g@email.com', groupId: group2.id },
    { firstName: 'Sebastián', lastName: 'Pérez', birthDate: new Date('2019-01-25'), parentName: 'Patricia Pérez', parentPhone: '+1 555-1007', parentEmail: 'patricia.p@email.com', groupId: group3.id },
    { firstName: 'Camila', lastName: 'Sánchez', birthDate: new Date('2018-08-08'), parentName: 'Diego Sánchez', parentPhone: '+1 555-1008', parentEmail: 'diego.s@email.com', groupId: group3.id },
    { firstName: 'Nicolás', lastName: 'Ramírez', birthDate: new Date('2013-04-17'), parentName: 'Elena Ramírez', parentPhone: '+1 555-1009', parentEmail: 'elena.r@email.com', groupId: group4.id },
    { firstName: 'Lucía', lastName: 'Torres', birthDate: new Date('2012-12-03'), parentName: 'Fernando Torres', parentPhone: '+1 555-1010', parentEmail: 'fernando.t@email.com', groupId: group4.id },
  ];

  const createdStudents = [];
  for (let i = 0; i < studentsData.length; i++) {
    const { groupId, ...studentData } = studentsData[i];
    const student = await prisma.student.upsert({
      where: { id: `student-${i + 1}` },
      update: {},
      create: {
        id: `student-${i + 1}`,
        academyId: academy.id,
        ...studentData,
        status: StudentStatus.ACTIVE,
      },
    });
    await prisma.studentGroup.upsert({
      where: {
        studentId_groupId_startDate: {
          studentId: student.id,
          groupId,
          startDate: new Date('2024-01-01'),
        },
      },
      update: {},
      create: {
        studentId: student.id,
        groupId,
        startDate: new Date('2024-01-01'),
        isActive: true,
      },
    });
    createdStudents.push({ student, groupId });
  }
  console.log('✅ Students created');

  // Payments (last 3 months)
  const now = new Date();
  for (const { student, groupId } of createdStudents) {
    const group = [group1, group2, group3, group4].find(g => g.id === groupId)!;
    for (let m = 0; m < 3; m++) {
      const date = subMonths(startOfMonth(now), m);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const isPaid = m > 0 || Math.random() > 0.3;
      await prisma.payment.upsert({
        where: { studentId_groupId_month_year: { studentId: student.id, groupId, month, year } },
        update: {},
        create: {
          academyId: academy.id,
          studentId: student.id,
          groupId,
          month,
          year,
          amount: group.monthlyPrice,
          status: isPaid ? PaymentStatus.PAID : PaymentStatus.PENDING,
          dueDate: new Date(year, month - 1, 10),
          paidAt: isPaid ? new Date(year, month - 1, Math.floor(Math.random() * 8) + 1) : null,
          method: isPaid ? (Math.random() > 0.5 ? 'Transferencia' : 'Efectivo') : null,
        },
      });
    }
  }
  console.log('✅ Payments created');

  // Leads
  const leadsData = [
    { name: 'Pedro Alonso', parentName: 'Marta Alonso', phone: '+1 555-2001', email: 'marta@email.com', childAge: 7, sportInterest: 'Fútbol', source: 'Redes sociales', status: LeadStatus.NEW },
    { name: 'Ana Ruiz', parentName: 'Juan Ruiz', phone: '+1 555-2002', email: 'juan.r@email.com', childAge: 10, sportInterest: 'Tenis', source: 'Referido', status: LeadStatus.CONTACTED },
    { name: 'Luis Moreno', parentName: 'Carmen Moreno', phone: '+1 555-2003', email: 'carmen@email.com', childAge: 5, sportInterest: 'Natación', source: 'Web', status: LeadStatus.NEW },
    { name: 'Elena Vega', parentName: 'Antonio Vega', phone: '+1 555-2004', email: 'antonio.v@email.com', childAge: 9, sportInterest: 'Fútbol', source: 'Referido', status: LeadStatus.CONVERTED },
    { name: 'Mario Díaz', parentName: 'Rosa Díaz', phone: '+1 555-2005', email: 'rosa.d@email.com', childAge: 12, sportInterest: 'Tenis', source: 'Google', status: LeadStatus.NEW },
  ];

  for (let i = 0; i < leadsData.length; i++) {
    await prisma.lead.upsert({
      where: { id: `lead-${i + 1}` },
      update: {},
      create: {
        id: `lead-${i + 1}`,
        academyId: academy.id,
        ...leadsData[i],
      },
    });
  }
  console.log('✅ Leads created');

  // Landing sections
  const sections = [
    {
      id: 'section-1', type: 'hero', order: 1, isActive: true,
      content: {
        title: 'Forma al Campeón que hay en Ti',
        subtitle: 'La mejor academia deportiva con entrenadores certificados y metodología de élite. Inscribe a tu hijo hoy.',
        ctaText: 'Solicita información',
        ctaLink: '#contacto',
        images: [],
      },
    },
    {
      id: 'section-2', type: 'programs', order: 2, isActive: true,
      content: {
        title: 'Nuestros Programas',
        subtitle: 'Disciplinas diseñadas para cada edad y nivel, con metodología profesional',
        programs: [
          { name: 'Fútbol', ageRange: '5 - 15 años', description: 'Metodología UEFA adaptada a cada etapa. Formamos técnica, táctica y valores.', icon: '⚽' },
          { name: 'Natación', ageRange: '4 - 12 años', description: 'Técnica correcta desde el inicio. Seguridad en el agua y desarrollo físico integral.', icon: '🏊' },
          { name: 'Tenis', ageRange: '8 - 16 años', description: 'Entrenadores certificados ITF. Desde iniciación hasta nivel competitivo.', icon: '🎾' },
        ],
      },
    },
    {
      id: 'section-3', type: 'schedules', order: 3, isActive: true,
      content: {
        title: 'Horarios y Grupos',
        subtitle: 'Encuentra el grupo perfecto según la edad y disponibilidad de tu hijo',
      },
    },
    {
      id: 'section-4', type: 'trainers', order: 4, isActive: true,
      content: {
        title: 'Nuestros Entrenadores',
        subtitle: 'Profesionales certificados con pasión por la enseñanza y años de experiencia',
      },
    },
    {
      id: 'section-5', type: 'testimonials', order: 5, isActive: true,
      content: {
        title: 'Lo que dicen nuestras familias',
        subtitle: 'Más de 200 familias confían en nosotros',
        testimonials: [
          { name: 'Roberto García', role: 'Padre de Alejandro, 7 años', text: 'Mi hijo ha mejorado muchísimo en solo 3 meses. Los entrenadores son excelentes y muy atentos con los niños.', rating: 5 },
          { name: 'Ana Martínez', role: 'Madre de Sofía, 9 años', text: 'Un ambiente increíble, muy profesional y los niños se divierten aprendiendo. 100% recomendable.', rating: 5 },
          { name: 'Carlos López', role: 'Padre de Mateo, 11 años', text: 'La mejor inversión para el desarrollo de mi hijo. Ha ganado confianza y disciplina.', rating: 5 },
          { name: 'María Rodríguez', role: 'Madre de Valentina, 8 años', text: 'Excelentes instalaciones y entrenadores que realmente se preocupan por cada niño.', rating: 5 },
        ],
      },
    },
    {
      id: 'section-6', type: 'gallery', order: 6, isActive: true,
      content: {
        title: 'Nuestra Galería',
        subtitle: 'Momentos especiales de nuestra academia',
      },
    },
    {
      id: 'section-7', type: 'cta', order: 7, isActive: true,
      content: {
        title: '¿Listo para que tu hijo sea campeón?',
        subtitle: 'Inscríbelo hoy y da el primer paso hacia su mejor versión. Cupos limitados.',
        ctaText: 'Inscribirse Ahora',
        whatsapp: '+15550100',
        whatsappText: 'Consultar por WhatsApp',
      },
    },
    {
      id: 'section-8', type: 'footer', order: 8, isActive: true,
      content: {
        address: 'Av. Principal 123, Ciudad',
        phone: '+1 555-0100',
        email: 'info@academiaelite.com',
        instagram: '#',
        facebook: '#',
        youtube: '#',
        mapEmbedUrl: '',
      },
    },
  ];

  for (const section of sections) {
    await prisma.landingSection.upsert({
      where: { id: section.id },
      update: { content: section.content as any },
      create: { ...section, content: section.content as any, academyId: academy.id },
    });
  }
  console.log('✅ Landing sections created');

  // Sample media: hero carousel images
  const heroImages = [
    { id: 'media-hero-1', url: 'https://images.unsplash.com/photo-1551958219-acbc595e3a5b?w=1200&q=80', altText: 'Niños jugando fútbol', order: 1 },
    { id: 'media-hero-2', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80', altText: 'Entrenamiento deportivo', order: 2 },
    { id: 'media-hero-3', url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80', altText: 'Academia de natación', order: 3 },
  ];

  for (const img of heroImages) {
    await prisma.landingMedia.upsert({
      where: { id: img.id },
      update: { url: img.url },
      create: { ...img, sectionId: 'section-1', academyId: academy.id },
    });
  }

  // Sample media: gallery images
  const galleryImages = [
    { id: 'media-gallery-1', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80', altText: 'Partido de fútbol', order: 1 },
    { id: 'media-gallery-2', url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&q=80', altText: 'Natación competitiva', order: 2 },
    { id: 'media-gallery-3', url: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&q=80', altText: 'Tenis juvenil', order: 3 },
    { id: 'media-gallery-4', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80', altText: 'Entrenamiento grupal', order: 4 },
    { id: 'media-gallery-5', url: 'https://images.unsplash.com/photo-1543357480-c60d40a5a5f4?w=600&q=80', altText: 'Celebración del equipo', order: 5 },
    { id: 'media-gallery-6', url: 'https://images.unsplash.com/photo-1521731978332-9e9e714bdd20?w=600&q=80', altText: 'Entrenador con niños', order: 6 },
  ];

  for (const img of galleryImages) {
    await prisma.landingMedia.upsert({
      where: { id: img.id },
      update: { url: img.url },
      create: { ...img, sectionId: 'section-6', academyId: academy.id },
    });
  }
  console.log('✅ Sample media images added');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Credentials:');
  console.log(`   Admin: admin@academiaelite.com / admin123`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
