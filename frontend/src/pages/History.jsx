import { useEffect, useState } from "react"
import api from "../api"
import './History.css'

function History() {

    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(false)
    const [stats , setStats] = useState(null)

    useEffect(() => {
        async function fetchJobs() {
            setLoading(true)
            const resp = await api.get("/jobs")
            setJobs(resp.data)

            const statResp = await api.get("/jobs/stats")
            setStats(statResp.data)
            setLoading(false)
        }
        fetchJobs()
    }, [])


    return (
        <>
            <div className="app-container">
                <h1>Job History</h1>
                {loading ?
                    (<p>Loading...</p>) :
                    (
                        (jobs.length > 0) ? (
                            <>
                            <div className="stats-strip">
                                <div className="stat-card">
                                    <div className="stat-value">{stats.total_jobs}</div>
                                    <div className="stat-label">Total Jobs </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-value">{stats.successful_jobs}</div>
                                    <div className="stat-label">Successful </div>
                                </div>
                                
                                <div className="stat-card">
                                    <div className="stat-value">{stats.avg_processing_seconds}s</div>
                                    <div className="stat-label">Avg Time </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-value">{stats.most_common_pair}</div>
                                    <div className="stat-label">Most Common </div>
                                </div>

                            </div>
                            <div className="history-list">
                                {jobs.map((job) => (
                                    <div key={job.id} className="history-card">

                                        <div className="history-info">
                                            <div className="history-filename">{job.file_name}</div>
                                            <div className="history-format">{job.source_format} &rarr; {job.target_format}</div>
                                            <div className="history-date">{new Date(job.created_at).toLocaleString()}</div>
                                        </div>

                                        <div className="history-right">
                                            <span className={`status-badge badge-${job.status}`}> {job.status} </span>
                                            {job.status === "done" &&
                                                <a href={`${import.meta.env.VITE_API_URL}/jobs/${job.id}/download`} className="history-download">Download</a>
                                            }
                                        </div>

                                    </div>

                                ))}
                            </div>
                            </>
                        ) : (
                            <p className="empty-state">No jobs yet - convert a file to see it here.</p>
                        )
                        
                )

                }

            </div>
        </>
    )
}

export default History