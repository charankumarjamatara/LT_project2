
const API_BASE_URL = "https://lt-project2-api.onrender.com";

// GET ALL records
export const getAll = async (resource) => {
  const response = await fetch(`${API_BASE_URL}/${resource}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${resource}`);
  }

  return response.json();
};

// GET a single record by ID
export const getById = async (resource, id) => {
  const response = await fetch(
    `${API_BASE_URL}/${resource}/${id}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch ${resource} record`);
  }

  return response.json();
};

// CREATE a record
export const createRecord = async (resource, data) => {
  const response = await fetch(`${API_BASE_URL}/${resource}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create ${resource} record`);
  }

  return response.json();
};

// UPDATE a record
export const updateRecord = async (resource, id, data) => {
  const response = await fetch(
    `${API_BASE_URL}/${resource}/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update ${resource} record`);
  }

  return response.json();
};

// DELETE a record
export const deleteRecord = async (resource, id) => {
  const response = await fetch(
    `${API_BASE_URL}/${resource}/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete ${resource} record`);
  }
};
