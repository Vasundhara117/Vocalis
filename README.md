#  Vocalis — Voice-Based Speech Therapy Platform

Vocalis is a full-stack web application designed to help users improve pronunciation and speech fluency through real-time voice interaction and gamified learning.
Unlike traditional language apps, Vocalis focuses on **active speaking practice** using speech recognition and adaptive difficulty.

---
##  Problem Statement

Many learners struggle with pronunciation but lack:
- Real-time feedback
- Consistent speaking practice
- Engaging learning systems

Vocalis solves this by combining **speech recognition + gamification + adaptive learning**.

---

##  Key Features

###  Real-Time Speech Analysis
- Integrated with Deepgram API for live speech recognition
- Users speak words and receive immediate feedback

###  Gamified Learning System
- Level-based progression (Alphabets → Words → Sentences)
- Achievements, streaks, and leaderboard system

###  Personalized Practice
- Tracks weak words automatically
- Generates custom practice decks

###  Progress Tracking
- Daily streak system
- Leaderboards (Time Attack mode)
- Achievement unlocking system

---

##  System Architecture

Frontend (React)  
⬇  
Backend (Node.js + Express)  
⬇  
MongoDB (User data, progress, leaderboard)  
⬇  
Deepgram API (Speech processing)

---

##  Tech Stack

**Frontend**
- React

**Backend**
- Node.js, Express.js

**Database**
- MongoDB

**Authentication**
- JWT, bcrypt

**API**
- Deepgram (speech recognition)

---

##  Installation

```bash
git clone https://github.com/your-username/vocalis.git
cd vocalis
npm install
