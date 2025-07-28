"use client";
import { useState } from 'react';
import axios from 'axios';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

export default function Home() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');

    const handleAsk = async () => {
        if (!question.trim()) return;
        const res = await axios.post('https://saknly-server-9air.vercel.app/api/saknly/v1/chat', { question });
        setAnswer(res.data.answer);
    };

    return (
        <Container maxWidth="sm" className="flex flex-col items-center justify-center min-h-screen">
            <Paper elevation={3} className="w-full p-8 flex flex-col items-center gap-6">
                <Typography variant="h4" className="mb-4 font-bold text-center">
                    Ask Our Chatbot
                </Typography>
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Ask a question..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="mb-4"
                    inputProps={{ className: 'py-3' }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAsk}
                    className="w-full py-3 text-lg font-semibold"
                >
                    Ask
                </Button>
                {answer && (
                    <Paper elevation={1} className="w-full mt-6 p-4 bg-gray-50">
                        <Typography variant="subtitle1" className="font-semibold mb-2">
                            Answer:
                        </Typography>
                        <Typography variant="body1" className="whitespace-pre-wrap">
                            {answer}
                        </Typography>
                    </Paper>
                )}
            </Paper>
        </Container>
    );
}