"use client";

import React from "react";
import { 
  Box,
  Typography,
  Container,
  Fade,
  Zoom,
  Paper,
  Avatar
} from "@mui/material";
import Grid from '@mui/material/Grid';
import axios from 'axios';
import TeamCard from '../../shared/components/TeamCard';


// Add Counter component for animated numbers
function Counter({ end, duration = 1500 }: { end: number, duration?: number }) {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    let frame: number;
    function animate() {
      start += increment;
      if (start < end) {
        setCount(Math.floor(start));
        frame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    }
    animate();
    return () => cancelAnimationFrame(frame);
  }, [end, duration]);
  return <>{count.toLocaleString()}</>;
}

const teamMembers = [
  {
    name: "Omar Mahmoud",
    role: "Frontend Developer",
    image: "/images/team/Omar.jpg",
    linkedin: "https://www.linkedin.com/in/omar-tarek-15a00a20a/",
    github: "https://github.com/OMARELSHARKWY",
    email: "elsharkawiiomar@gmail.com",
    description: "Seasoned frontend developer passionate about building intuitive and visually appealing user interfaces.",
    skills: ["React", "Next.js", "TypeScript", "Material-UI", "Redux"],
    initials: "OT"
  },
  {
    name: "Maryam Zaghlool",
    role: "Backend Developer",
    image: "/images/team/Mariem.jpeg",
    linkedin: "https://www.linkedin.com/in/maryam-zaghlool/",
    github: "https://github.com/MaryamZaghlool",
    email: "maryamzaghlool0@gmail.com",
    description: "Skilled backend engineer focusing on robust API design, database management, and scalable server solutions.",
    skills: ["Node.js", "Express.js", "MongoDB", "RESTful APIs", "Authentication"],
    initials: "MA"
  },
  {
    name: "Mahmoud Adel",
    role: "Backend Developer , Product Manager",
    image: "/images/team/Mahmoud.jpeg",
    linkedin: "https://www.linkedin.com/in/mahmoud-adel-15a00a20a/",
    github: "https://github.com/mahmoudadel810",
    email: "mahmoud@saknly.com",
    description: "Strategic product manager driving innovation and user-centric solutions in the real estate technology space.",
    skills: ["Product Strategy", "User Research", "Agile", "Data Analysis", "Stakeholder Management"],
    initials: "MZ"
  },
  {
    name: "Olfat Nasser",
    role: "UI/UX Designer",
    image: "/images/team/Ulfat.jpeg",
    linkedin: "https://www.linkedin.com/in/ulfat-said-i/",
    github: "https://github.com/ulfat333",
    email: "ulfat@saknly.com",
    description: "Creative UI/UX designer crafting delightful user experiences and visually stunning interfaces.",
    skills: ["Figma", "Sketch", "User Research", "Wireframing", "Prototyping"],
    initials: "US"
  },
  {
    name: "Tasbih Attia",
    role: "Marketing Specialist",
    image: "/images/team/Profile.jpg",
    linkedin: "https://www.linkedin.com/in/tasbih-attia-899575308/",
    github: "https://github.com/Tasbih-Attia",
    email: "tasbih@saknly.com",
    description: "Digital marketing expert specializing in growth strategies and brand development for real estate platforms.",
    skills: ["Digital Marketing", "SEO", "Social Media", "Content Strategy", "Analytics"],
    initials: "TA"
  }
];

export default function AboutPage() {
  const [propertyCount, setPropertyCount] = React.useState(0);
  const [userCount, setUserCount] = React.useState(0);
  const [agencyCount, setAgencyCount] = React.useState(0); // For agency count
  const [loadingStats, setLoadingStats] = React.useState(true);
  const [errorStats, setErrorStats] = React.useState('');

  React.useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      setErrorStats('');
      try {
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
        // Fetch property count
        const propertiesRes = await axios.get(`${BASE_URL}/properties/allProperties`);
        setPropertyCount(propertiesRes.data.count || (Array.isArray(propertiesRes.data.data) ? propertiesRes.data.data.length : 0));

        // Fetch user count (clients)
        const usersRes = await axios.get(`${BASE_URL}/users/get-all-users`);
        let userCountValue = 0;
        if (Array.isArray(usersRes.data.data)) {
          userCountValue = usersRes.data.data.length;
        } else if (Array.isArray(usersRes.data.users)) {
          userCountValue = usersRes.data.users.length;
        } else if (usersRes.data.data && Array.isArray(usersRes.data.data.users)) {
          userCountValue = usersRes.data.data.users.length;
        }
        setUserCount(userCountValue);

        // Fetch agency count - requires new API or modification of existing one
        // For now, setting a placeholder or fetching all featured agencies if that's acceptable
        const agenciesRes = await axios.get(`${BASE_URL}/agencies/featured`); // Adjust if a 'getAllAgencies' is added
        setAgencyCount(agenciesRes.data.data.length || 0);

      } catch (err) {
        console.error('Error fetching stats:', err);
        setErrorStats('فشل في تحميل الإحصائيات.');
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { number: propertyCount, label: "عقار متاح" },
    { number: userCount, label: "عميل راضي" },
    { number: agencyCount, label: "وكالة عقارية" },
    { number: "24/7", label: "دعم فني" }
  ];

  return (
    <Box className="bg-gradient-to-br from-gray-50 to-gray-200 dark:from-dark-900 dark:to-dark-800" sx={{ minHeight: "100vh" }}>
      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: "white",
        py: { xs: 8, md: 12 },
        position: "relative",
        overflow: "hidden"
      }}>
        <Container maxWidth="lg">
          <Box sx={{ position: "relative", zIndex: 2 }}>
            <Fade in timeout={1000}>
              <Box sx={{ textAlign: "center", mb: 6 }}>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontWeight: 900, 
                    mb: 3, 
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                  }}
                >
                  تعرّف على فريق سكنلي
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 400, 
                    opacity: 0.9,
                    maxWidth: 800,
                    mx: "auto",
                    lineHeight: 1.6
                  }}
                >
                  حيث يلتقي الابتكار مع الخبرة لبناء مستقبل العقارات الرقمية
                </Typography>
              </Box>
            </Fade>
            
            {/* Stats Section */}
            <Zoom in timeout={1500}>
              {/* Restore original Grid-based layout for stats */}
              <Box sx={{ mt: 8 }}>
                <Grid container spacing={4} justifyContent="center" alignItems="stretch">
                  {stats.map((stat, index) => (
                    <Grid size={{ xs: 12, md: 3 }} key={index}>
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 900,
                            mb: 1,
                            fontSize: { xs: '2rem', md: '2.5rem' }
                          }}
                        >
                          {stat.number === '24/7'
                            ? stat.number
                            : <Counter end={parseInt(stat.number.toString().replace(/\D/g, ''))} duration={2500 + index * 500} />
                          }{stat.number !== '24/7' && (stat.number !== '24/7' ? '+' : '')}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            opacity: 0.9,
                            fontSize: { xs: '0.9rem', md: '1rem' }
                          }}
                        >
                          {stat.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Zoom>
          </Box>
        </Container>
        
        {/* Background Pattern */}
        <Box sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "100%",
          height: "100%",
          opacity: 0.1,
          background: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.4\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
          zIndex: 1
        }} />
      </Box>

      {/* Mission & Vision Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 6, 
          mb: 10 
        }}>
          <Box sx={{ flex: 1 }}>
            <Fade in timeout={1200}>
              <Paper elevation={0} sx={{ 
                p: { xs: 4, md: 6 }, 
                borderRadius: 4, 
                background: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)",
                height: "100%",
                position: "relative",
                overflow: "hidden"
              }}>
                <Box sx={{ position: "relative", zIndex: 2 }}>
                  <Typography variant="h4" className="text-sky-600 dark:text-sky-400" sx={{ fontWeight: 800, mb: 3 }}>
                    رؤيتنا
                  </Typography>
                  <Typography variant="body1" >
                    أن نكون المنصة الرائدة في مجال العقارات الرقمية في الوطن العربي، ونبني مجتمعًا متكاملاً من البائعين والمشترين والوكلاء العقاريين من خلال التكنولوجيا المتقدمة والخدمات المتميزة.
                  </Typography>
                </Box>
                <Box sx={{
                  position: "absolute",
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "rgba(2, 132, 199, 0.1)",
                  zIndex: 1
                }} />
              </Paper>
            </Fade>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Fade in timeout={1400}>
              <Paper elevation={0} sx={{ 
                p: { xs: 4, md: 6 }, 
                borderRadius: 4, 
                background: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)",
                height: "100%",
                position: "relative",
                overflow: "hidden"
              }}>
                <Box sx={{ position: "relative", zIndex: 2 }}>
                  <Typography variant="h4" className="text-amber-600 dark:text-amber-400" sx={{ fontWeight: 800, mb: 3 }}>
                    رسالتنا
                  </Typography>
                  <Typography variant="body1" >
                    توفير منصة موثوقة وسهلة الاستخدام تساعد المستخدمين على إيجاد وبيع وشراء العقارات بكل شفافية وراحة، مع التركيز على تجربة مستخدم استثنائية وأمان عالي.
                  </Typography>
                </Box>
                <Box sx={{
                  position: "absolute",
                  bottom: -20,
                  left: -20,
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "rgba(217, 119, 6, 0.1)",
                  zIndex: 1
                }} />
              </Paper>
            </Fade>
          </Box>
        </Box>

        {/* Values Section */}
        <Box sx={{ mb: 10 }}>
          <Typography variant="h3" className="text-gray-800 dark:text-white" sx={{ 
            textAlign: "center", 
            fontWeight: 800, 
            mb: 6 
          }}>
            قيمنا الأساسية
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Box className="bg-white dark:bg-dark-800" sx={{ textAlign: "center", p: 3, borderRadius: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: "100%" }}>
                <Avatar sx={{ bgcolor: "#1e40af", width: 64, height: 64, mx: "auto", mb: 2 }}>
                  <i className="fas fa-lightbulb" />
                </Avatar>
                <Typography variant="h6" className="text-blue-700 dark:text-blue-400" sx={{ fontWeight: 700, mb: 1 }}>
                  الابتكار
                </Typography>
                <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
                  نسعى دائمًا لتبني أحدث التقنيات وتقديم حلول مبتكرة لتحسين تجربة المستخدمين في سوق العقارات.
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box className="bg-white dark:bg-dark-800" sx={{ textAlign: "center", p: 3, borderRadius: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: "100%" }}>
                <Avatar sx={{ bgcolor: "#059669", width: 64, height: 64, mx: "auto", mb: 2 }}>
                  <i className="fas fa-shield-alt" />
                </Avatar>
                <Typography variant="h6" className="text-emerald-600 dark:text-emerald-400" sx={{ fontWeight: 700, mb: 1 }}>
                  الموثوقية
                </Typography>
                <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
                  نلتزم بتقديم معلومات دقيقة وموثوقة لضمان اتخاذ قرارات مستنيرة، وبناء علاقات طويلة الأمد مع عملائنا.
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box className="bg-white dark:bg-dark-800" sx={{ textAlign: "center", p: 3, borderRadius: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: "100%" }}>
                <Avatar sx={{ bgcolor: "#d97706", width: 64, height: 64, mx: "auto", mb: 2 }}>
                  <i className="fas fa-users" />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "#d97706" }}>
                  الشفافية
                </Typography>
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  نؤمن بالشفافية الكاملة في جميع تعاملاتنا، لضمان الوضوح والثقة بين جميع الأطراف.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Team Section */}
        <Box sx={{ mb: 10 }}>
        <Typography variant="h3" className="text-gray-800 dark:text-white" sx={{ 
            textAlign: "center", 
            fontWeight: 800, 
            mb: 6 
          }}>
           فريق سكنلي
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {teamMembers.map((member, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Box sx={{ display: 'flex', justifyContent: 'center', height: '100%' }}>
                  <TeamCard member={member} index={index} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}