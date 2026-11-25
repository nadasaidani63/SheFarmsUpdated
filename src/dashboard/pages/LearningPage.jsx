import React, { useState } from 'react';
import UiIcon from '../../components/UiIcon';
import { BookOpen, Play, Users, Award, Video, FileText, Headphones, Star, Clock, User } from 'lucide-react';
import '../styles/PageTitles.css';

const LearningPage = () => {
  const [activeTab, setActiveTab] = useState('courses');

  const courses = [
    {
      id: 1,
      title: 'Sustainable Farming Techniques',
      instructor: 'Dr. Sarah Ahmed',
      duration: '4 weeks',
      rating: 4.8,
      students: 1250,
      level: 'Beginner',
      progress: 0,
      type: 'video'
    },
    {
      id: 2,
      title: 'Digital Marketing for Farmers',
      instructor: 'Maria Rodriguez',
      duration: '3 weeks',
      rating: 4.6,
      students: 890,
      level: 'Intermediate',
      progress: 65,
      type: 'mixed'
    },
    {
      id: 3,
      title: 'Financial Planning in Agriculture',
      instructor: 'Prof. Hassan Ali',
      duration: '5 weeks',
      rating: 4.9,
      students: 2100,
      level: 'Advanced',
      progress: 30,
      type: 'text'
    }
  ];

  const webinars = [
    {
      id: 1,
      title: 'Climate-Smart Agriculture',
      speaker: 'Dr. Fatima Benali',
      date: '2024-01-20',
      time: '14:00 GMT',
      attendees: 156,
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Women Leadership in Farming',
      speaker: 'Amina Kone',
      date: '2024-01-15',
      time: '16:00 GMT',
      attendees: 234,
      status: 'completed'
    }
  ];

  const achievements = [
    { name: 'First Course Completed', date: '2024-01-10', icon: 'learning' },
    { name: 'Sustainable Farming Expert', date: '2024-01-05', icon: 'sprout' },
    { name: 'Community Helper', date: '2023-12-28', icon: 'community' }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'text': return <FileText className="w-4 h-4" />;
      case 'mixed': return <Headphones className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getLevelClass = (level) => {
    switch (level) {
      case 'Beginner': return 'task-type personal';
      case 'Intermediate': return 'task-status status-pending';
      case 'Advanced': return 'task-status status-in-progress';
      default: return 'task-type personal';
    }
  };

  return (
    <div className="tasks-container">
      {/* Header */}
      <div className="tasks-header">
        <h1 className="page-main-title">
          <BookOpen className="w-7 h-7 title-icon" />
          Learning Resources
        </h1>
        <button className="btn-primary">
          <Play className="w-5 h-5" />
          Start Learning
        </button>
      </div>

      {/* Stats Cards */}
      <div className="tasks-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <div className="task-card">
          <div className="task-header">
            <h3 className="task-title">Courses Completed</h3>
            <Award className="w-5 h-5 text-gray-600" />
          </div>
          <div className="task-description">
            <div className="text-2xl font-bold text-gray-800">12</div>
          </div>
        </div>

        <div className="task-card">
          <div className="task-header">
            <h3 className="task-title">Hours Learned</h3>
            <Clock className="w-5 h-5 text-gray-600" />
          </div>
          <div className="task-description">
            <div className="text-2xl font-bold text-gray-800">84h</div>
          </div>
        </div>

        <div className="task-card">
          <div className="task-header">
            <h3 className="task-title">Certificates</h3>
            <Award className="w-5 h-5 text-gray-600" />
          </div>
          <div className="task-description">
            <div className="text-2xl font-bold text-gray-800">8</div>
          </div>
        </div>

        <div className="task-card">
          <div className="task-header">
            <h3 className="task-title">Community Rank</h3>
            <Star className="w-5 h-5 text-gray-600" />
          </div>
          <div className="task-description">
            <div className="text-2xl font-bold text-gray-800">#127</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tasks-filters">
        <div className="filter-group">
          <div className="quick-actions">
            {[
              { id: 'courses', label: 'My Courses', icon: BookOpen },
              { id: 'webinars', label: 'Webinars', icon: Video },
              { id: 'achievements', label: 'Achievements', icon: Award }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`filter-btn ${activeTab === tab.id ? 'active' : ''}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'courses' && (
        <div className="tasks-section">
          <div className="section-header">
            <h2 className="section-title-pink">
              <BookOpen className="w-6 h-6 title-icon" />
              My Courses
            </h2>
          </div>
          <div className="tasks-grid">
            {courses.map((course, index) => (
              <div key={course.id} className="task-card">
                <div className="task-header">
                  <h3 className="task-title">{course.title}</h3>
                  <div className={getLevelClass(course.level)}>
                    {getTypeIcon(course.type)}
                    {course.level}
                  </div>
                </div>
                
                <div className="task-assignee">
                  <User className="w-4 h-4" />
                  {course.instructor}
                </div>
                
                <div className="task-meta">
                  <small className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </small>
                  <small className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {course.rating}
                  </small>
                  <small className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.students} students
                  </small>
                </div>
                
                {course.progress > 0 && (
                  <div className="task-progress">
                    <div className="progress-label">
                      <span className="progress-text">Progress</span>
                      <span className="progress-percentage">{course.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="task-actions">
                  <button className="btn-small btn-status">
                    {course.progress > 0 ? 'Continue' : 'Start Course'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'webinars' && (
        <div className="tasks-section">
          <div className="section-header">
            <h2 className="section-title-pink">
              <Video className="w-6 h-6 title-icon" />
              Webinars
            </h2>
          </div>
          <div className="tasks-grid">
            {webinars.map((webinar, index) => (
              <div key={webinar.id} className="task-card">
                <div className="task-header">
                  <h3 className="task-title">{webinar.title}</h3>
                  <div className={`task-status ${webinar.status === 'upcoming' ? 'status-pending' : 'status-completed'}`}>
                    <Video className="w-4 h-4" />
                    {webinar.status}
                  </div>
                </div>
                
                <div className="task-assignee">
                  <User className="w-4 h-4" />
                  {webinar.speaker}
                </div>
                
                <div className="task-meta">
                  <small>{webinar.date} at {webinar.time}</small>
                  <small className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {webinar.attendees} attendees
                  </small>
                </div>
                
                <div className="task-actions">
                  <button className="btn-small btn-status">
                    {webinar.status === 'upcoming' ? 'Register' : 'Watch Recording'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="tasks-section">
          <h2 className="section-title">
            <Award className="w-6 h-6" />
            Achievements
          </h2>
          <div className="tasks-grid">
            {achievements.map((achievement, index) => (
              <div key={index} className="task-card" style={{ textAlign: 'center' }}>
                <div className="task-description">
                  <div className="text-4xl mb-4"><UiIcon name={achievement.icon} size={28} /></div>
                  <h3 className="task-title">{achievement.name}</h3>
                  <p className="text-gray-600 text-sm">Earned on {achievement.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPage;
