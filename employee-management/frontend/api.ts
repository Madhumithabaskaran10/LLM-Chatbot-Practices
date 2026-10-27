
const API_URL = "http://127.0.0.1:8000";

export type Employee = {
  id: number;
  name: string;
  email: string;
  role: string;
  age: number;
  department: string;
};

export type EmployeeInput = Omit<Employee, "id">;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", response.status, errorText);
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  return response.json() as Promise<T>;
}

export async function getEmployees(): Promise<Employee[]> {
  const response = await fetch(`${API_URL}/employees`, {
    cache: "no-store",
  });

  return handleResponse<Employee[]>(response);
}

export async function addEmployee(
  employee: EmployeeInput
): Promise<Employee> {
  const response = await fetch(`${API_URL}/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employee),
  });

  return handleResponse<Employee>(response);
}

export async function updateEmployee(
  id: number,
  employee: EmployeeInput
): Promise<Employee> {
  const response = await fetch(`${API_URL}/employees/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employee),
  });

  return handleResponse<Employee>(response);
}

export async function deleteEmployee(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/employees/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", response.status, errorText);
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }
}
