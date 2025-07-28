"use client";
import React, { useState } from "react";
import Image from "next/image";
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  Chip, 
  IconButton, 
  Fade 
} from "@mui/material";
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  linkedin: string;
  github: string;
  email: string;
  description: string;
  skills: string[];
  initials: string;
}

interface TeamCardProps {
  member: TeamMember;
  index: number;
}

export default function TeamCard({ member, index }: TeamCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box>
      <Fade in timeout={1000 + index * 200}>
        <Card 
          elevation={0}
          sx={{ 
            borderRadius: 4,
            background: "white",
            overflow: "hidden",
            transition: "all 0.3s ease",
            transform: isHovered ? "scale(1.02)" : "scale(1)",
            boxShadow: isHovered ? "0 20px 40px rgba(0,0,0,0.15)" : "0 4px 20px rgba(0,0,0,0.08)",
            cursor: "pointer"
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Box sx={{ 
            background: "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)",
            p: 4,
            textAlign: "center",
            color: "white"
          }}>
            <Box sx={{ 
              width: 120, 
              height: 120, 
              mx: "auto", 
              mb: 2,
              borderRadius: "50%",
              border: "4px solid rgba(255,255,255,0.3)",
              overflow: "hidden",
              position: "relative",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: 700,
              color: "white"
            }}>
              {member.image && member.image !== "/images/team/Profile.jpg" ? (
                <Image
                  src={member.image}
                  alt={member.name}
                  width={120}
                  height={120}
                  style={{
                    objectFit: "cover",
                    borderRadius: "50%"
                  }}
                />
              ) : (
                <span>{member.initials}</span>
              )}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              {member.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {member.role}
            </Typography>
          </Box>
          
          <CardContent sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ 
              color: "#6b7280", 
              mb: 3, 
              lineHeight: 1.6,
              minHeight: 60
            }}>
              {member.description}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {member.skills.map((skill, skillIndex) => (
                  <Chip 
                    key={skillIndex}
                    label={skill} 
                    size="small" 
                    sx={{ 
                      background: "#e0f7fa", 
                      color: "#0284c7",
                      fontWeight: 500
                    }} 
                  />
                ))}
              </Box>
            </Box>
            
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
              <IconButton 
                href={member.linkedin} 
                target="_blank"
                sx={{ 
                  color: "#0077b5",
                  "&:hover": { background: "rgba(0,119,181,0.1)" }
                }}
              >
                <LinkedInIcon />
              </IconButton>
              <IconButton 
                href={member.github} 
                target="_blank"
                sx={{ 
                  color: "#333",
                  "&:hover": { background: "rgba(51,51,51,0.1)" }
                }}
              >
                <GitHubIcon />
              </IconButton>
              <IconButton 
                href={`mailto:${member.email}`}
                sx={{ 
                  color: "#ea4335",
                  "&:hover": { background: "rgba(234,67,53,0.1)" }
                }}
              >
                <EmailIcon />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
} 