import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTopics } from '../context/TopicContext.jsx';
import NewsSection from '../components/NewsSection.jsx';
import { fetchTopicNews } from '../services/topicService.js';
import './FollowingPage.css';

export default function TopicDetail() {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const { followedTopics, addToHistory } = useTopics();

    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notFoundTimeout, setNotFoundTimeout] = useState(false);

    // Find the topic in the context state
    const topic = followedTopics.find(t => t.id === topicId);

    // If context hasn't hydrated yet, wait up to 5s before showing not-found
    useEffect(() => {
        if (topic) return;
        const t = setTimeout(() => setNotFoundTimeout(true), 5000);
        return () => clearTimeout(t);
    }, [topic]);

    useEffect(() => {
        if (!topic) return;

        const loadNews = async () => {
            setLoading(true);
            try {
                // Fetch fresh news for this topic
                const data = await fetchTopicNews(topic);
                setArticles(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadNews();
    }, [topicId, topic]); // Dependency on topicId/topic

    // Handle "Topic Not Found" after initial load
    if (!topic) {
        return (
             <div className="page-container">
                 <div className="loading" style={{padding: '20px'}}>
                     {notFoundTimeout ? (
                         <>
                             <p>Topic not found.</p>
                             <button onClick={() => navigate('/following')}>Back to List</button>
                         </>
                     ) : (
                         <p>Loading topic…</p>
                     )}
                 </div>
             </div>
        );
    }

    return (
        <div className="page-container">
            {/* Custom Sticky Header */}
            <header
                className="header"
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    background: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border-color)',
                    padding: '10px 15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                }}
            >
                <button
                    onClick={() => navigate('/following')}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: 'var(--text-primary)'
                    }}
                >
                    ←
                </button>
                <h1 style={{margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <span>{topic?.icon}</span>
                    {topic?.name}
                </h1>
            </header>

            <main className="main-content" style={{paddingTop: '0'}}>
                {loading ? (
                    <div className="loading" style={{padding: '20px', textAlign: 'center'}}>
                        <div className="loading__spinner"></div>
                        <p>Fetching latest news...</p>
                    </div>
                ) : (
                    <div style={{padding: '10px'}}>
                        <NewsSection
                            id={`topic-${topicId}`}
                            title={`Latest on ${topic?.name}`}
                            icon={topic?.icon}
                            news={articles}
                            maxDisplay={50}
                            showExpand={false}
                            colorClass="news-section__title--world"
                            // Anticipating Step 8 feature
                            onArticleClick={(article) => addToHistory(article)}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
