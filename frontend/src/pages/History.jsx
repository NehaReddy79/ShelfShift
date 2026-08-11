import { useEffect, useState } from "react"
import api from "../api"
import '../App.css'

function History() {

    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(false)


    useEffect(() => {
        async function fetchJobs() {
            setLoading(true)
            const resp = await api.get("/jobs")
            setJobs(resp.data)
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
                            jobs.map((job) => (
                                <div key={job.id}>
                                    <p>File Name : {job.file_name}</p>
                                    <p>Job id : {job.id}</p>
                                    <p>{job.source_format} &rarr; {job.target_format}</p>
                                    <p>Status  : {job.status}</p>
                                    <p>Created at : {new Date(job.created_at).toLocaleString()}</p>
                                    <p>Completed at : {job.completed_at ? new Date(job.completed_at).toLocaleString() : "-"}</p>
                                    {job.status === "done" &&
                                        <a href={`${import.meta.env.VITE_API_URL}/jobs/${job.id}/download`}>Download</a>
                                    }
                                </div>

                            ))
                        ) : (
                            <p>No Jobs Done Yet</p>
                        )
                        
                )

                }

            </div>
        </>
    )
}

export default History