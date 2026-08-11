import { useState , useEffect } from "react"
import api from "./api"


function App() {
  const [file , setFile] = useState(null)
  const [targetFormat , setTargetFormat] = useState("pdf")
  const [result , setResult] = useState(null)
  const [loading , setLoading] = useState(false)
  const [jobId , setJobId] = useState("")
  const [jobStatus , setJobStatus] = useState(null)

  function handleFileChange(e){
    setFile(e.target.files[0])
  }

  async function handleSubmit(e){
    e.preventDefault()

    if(!file) return 

    setLoading(true)

    const formData = new FormData();
    formData.append("file" , file)
    formData.append("target_format" , targetFormat)

    try{
      const resp = await api.post("/convert" , formData)
      setResult(resp.data)
      setJobId(resp.data.job_id)

    }catch(err){
      console.error(err)
      alert(err.response?.data?.detail || "Upload failed")
    }finally{
      setLoading(false)
    }
  }

  useEffect(() =>{

    if(!jobId) return

    const interval = setInterval(async () => {
      const resp = await api.get(`/jobs/${jobId}`)
      setJobStatus(resp.data)

      if(resp.data.status === "done" || resp.data.status === "failed"){
        clearInterval(interval)
      }
    },2000)
    
    return () => clearInterval(interval)

  }, [jobId]);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange}></input>

        <select value={targetFormat} onChange={(e) => setTargetFormat(e.target.value)}>
          <option value="pdf">PDF</option>
          <option value="epub">EPUB</option>
          <option value="mobi">MOBI</option>
          <option value="txt">TXT</option>
        </select>

        <button type="submit" disabled={loading}> 
          {loading ? 'Converting..' : 'Convert'}
        </button>
      </form>
      {
        jobStatus && jobStatus?.status !== "done" && jobStatus?.status !== "failed" && (
          <p>Status : processing...</p>
        )
      }
      {
        jobStatus?.status === "done" && (
          <a href={`${import.meta.env.VITE_API_URL}/jobs/${jobId}/download`}>Download</a>
        )
      }
      {
        jobStatus?.status === "failed" && (
          <p>{jobStatus.error_message}</p>
        )
      }
      {
      result && (
      <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </>
  )
}

export default App
