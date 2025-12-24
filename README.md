#  Vocalis

Vocalis is a React-based web application focused on language learning and speech practice through interactive, game-based experiences. The application uses real-time speech recognition and gamification techniques to help users improve pronunciation and consistency.

---

##  Features

###  Speech Recognition
- Integrated with the **Deepgram API** for transcribing user speech.
- Allows users to practice pronunciation by speaking words aloud.

###  Interactive Gameplay
- Structured **level-based system** with themed levels.
- Each level contains:
  - Level name
  - Description
  - Theme color
  - List of words
- **Picture Round** mode where users identify images (e.g., CAT, DOG, CAR) by speaking, without text prompts.

###  Personalized Practice
- Tracks words not yet mastered by the user.
- Automatically generates a **Personalized Practice Deck** for targeted improvement.

---

##  Gamification & Progress Tracking

###  Achievements
Users can unlock achievements such as:
- **First Steps** – Master the first word
- **Word Wizard** – Master 10 words
- **Heating Up** – Maintain a 3-day learning streak

###  Streak System
- Calculates daily practice streaks.
- Encourages consistent usage.

###  Leaderboard
- Global leaderboard for **Time Attack** mode.
- Displays top 10 scores and maximum combo streaks.

---

##  Tech Stack

### Frontend
- React
- Bootstrapped with **Create React App**

### Backend
- Node.js
- Express.js
- RESTful APIs for authentication, progress tracking, and leaderboard management
- Acts as a secure proxy for Deepgram API calls

### Database
- MongoDB
- Stores user data, progress, achievements, levels, and leaderboard scores

### Authentication & Security
- JWT (JSON Web Tokens) for authentication
- Passwords hashed using **bcryptjs**


---

##  Installation & Setup

### Prerequisites
- Node.js (v16 or later recommended)
- MongoDB (local or cloud instance)
- Deepgram API key

### Installation

```bash
git clone https://github.com/your-username/vocalis.git
cd vocalis
npm install
