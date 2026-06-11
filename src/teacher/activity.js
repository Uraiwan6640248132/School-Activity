import React, { useEffect, useState } from "react";
import axios from "axios";

function Activity() {
  const [activities, setActivities] = useState([]);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    const res = await axios.get("http://localhost:3001/activities");
    setActivities(res.data);
  };

  const handleSubmit = async () => {
    if (editId) {
      await axios.put(
        `http://localhost:3001/activities/${editId}`,
        {
          title,
          details,
          activity_date: activityDate,
        }
      );
    } else {
      await axios.post(
        "http://localhost:3001/activities",
        {
          title,
          details,
          activity_date: activityDate,
        }
      );
    }

    setTitle("");
    setDetails("");
    setActivityDate("");
    setEditId(null);

    fetchActivities();
  };

  const handleDelete = async (id) => {
    await axios.delete(
      `http://localhost:3001/activities/${id}`
    );
    fetchActivities();
  };

  const handleEdit = (item) => {
    setEditId(item.activity_id);
    setTitle(item.title);
    setDetails(item.details);
    setActivityDate(
      item.activity_date?.split("T")[0]
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Activities</h2>

      <input
        type="text"
        placeholder="ชื่อกิจกรรม"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <br /><br />

      <textarea
        placeholder="รายละเอียด"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
      />

      <br /><br />

      <input
        type="date"
        value={activityDate}
        onChange={(e) => setActivityDate(e.target.value)}
      />

      <br /><br />

      <button onClick={handleSubmit}>
        {editId ? "Update" : "Add"}
      </button>

      <hr />

      {activities.map((item) => (
        <div key={item.activity_id}>
          <h4>{item.title}</h4>
          <p>{item.details}</p>
          <p>{item.activity_date}</p>

          <button
            onClick={() => handleEdit(item)}
          >
            Edit
          </button>

          <button
            onClick={() =>
              handleDelete(item.activity_id)
            }
          >
            Delete
          </button>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default Activity;