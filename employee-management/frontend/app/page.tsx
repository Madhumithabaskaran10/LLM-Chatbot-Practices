
"use client";

import { useEffect, useState } from "react";
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee as deleteEmployeeAPI,
} from "../api";

import type { Employee, EmployeeInput } from "../api";

type EmployeeForm = {
  name: string;
  email: string;
  role: string;
  age: string;
  department: string;
};

const emptyForm: EmployeeForm = {
  name: "",
  email: "",
  role: "",
  age: "",
  department: "",
};

const initialEmployees: Employee[] = [];

export default function Home() {
  const [activePage, setActivePage] = useState("dashboard");
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<EmployeeForm>(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEmployees() {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error("Error loading employees:", error);
      }
    }

    loadEmployees();
  }, []);

  const departmentCount = new Set(
    employees.map((employee) => employee.department.trim().toLowerCase())
  ).size;

  function openAddForm() {
    setEditingId(null);
    setFormData(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEditForm(employee: Employee) {
    setEditingId(employee.id);
    setFormData({
      name: employee.name,
      email: employee.email,
      role: employee.role,
      age: String(employee.age),
      department: employee.department,
    });
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
    setError("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    const name = formData.name.trim();
    const email = formData.email.trim();
    const role = formData.role.trim();
    const department = formData.department.trim();
    const age = Number(formData.age);

    if (!name || !email || !role || !department || !formData.age) {
      setError("Please fill in all fields.");
      return;
    }

    if (!Number.isInteger(age) || age < 18 || age > 100) {
      setError("Age must be a whole number between 18 and 100.");
      return;
    }

    const duplicateEmail = employees.some(
      (employee) =>
        employee.email.toLowerCase() === email.toLowerCase() &&
        employee.id !== editingId
    );

    if (duplicateEmail) {
      setError("This email already belongs to another employee.");
      return;
    }

    const employeeData: EmployeeInput = {
      name,
      email,
      role,
      age,
      department,
    };

    try {
      if (editingId !== null) {
        const updatedEmployee = await updateEmployee(
          editingId,
          employeeData
        );

        setEmployees((current) =>
          current.map((employee) =>
            employee.id === editingId ? updatedEmployee : employee
          )
        );
      } else {
        const newEmployee = await addEmployee(employeeData);

        setEmployees((current) => [...current, newEmployee]);
      }

      closeForm();
    } catch (err) {
      console.error("Error saving employee:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save employee. Please try again."
      );
    }
  }

  async function deleteEmployee(id: number) {
    const employee = employees.find((item) => item.id === id);

    if (!employee) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.name}?`
    );

    if (!confirmed) return;

    try {
      await deleteEmployeeAPI(id);

      setEmployees((current) =>
        current.filter((item) => item.id !== id)
      );
    } catch (err) {
      console.error("Error deleting employee:", err);

      window.alert(
        err instanceof Error
          ? err.message
          : "Failed to delete employee."
      );
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[#E8E5E1] px-4 py-3 text-sm outline-none transition focus:border-[#FF795F] focus:ring-2 focus:ring-[#FF795F]/20";

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#25272B]">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="w-56 shrink-0 bg-[#25272B] p-5 text-white sm:w-64 sm:p-6">
          <h1 className="text-2xl font-bold tracking-wide">
            PEOPLE<span className="text-[#FF795F]">.</span>
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Employee Management
          </p>

          <nav className="mt-10 space-y-2">
            <button
              type="button"
              onClick={() => setActivePage("dashboard")}
              className={`block w-full rounded-lg px-4 py-3 text-left transition ${
                activePage === "dashboard"
                  ? "bg-[#414348] text-[#FF795F]"
                  : "text-gray-300 hover:bg-[#414348] hover:text-white"
              }`}
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => setActivePage("employees")}
              className={`block w-full rounded-lg px-4 py-3 text-left transition ${
                activePage === "employees"
                  ? "bg-[#414348] text-[#FF795F]"
                  : "text-gray-300 hover:bg-[#414348] hover:text-white"
              }`}
            >
              Employees
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1 p-5 sm:p-8">

          {/* Dashboard */}
          {activePage === "dashboard" && (
            <>
              <p className="text-sm font-medium uppercase tracking-widest text-[#6B6B70]">
                Overview / Dashboard
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    Dashboard
                  </h2>

                  <p className="mt-2 text-[#6B6B70]">
                    Welcome back! Here&apos;s what&apos;s happening with your team.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddForm}
                  className="rounded-lg bg-[#FF795F] px-5 py-3 font-semibold transition hover:bg-[#F2674C]"
                >
                  + Add Employee
                </button>
              </div>

              <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#E8E5E1] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <p className="text-sm font-medium text-[#6B6B70]">
                    Total Employees
                  </p>

                  <p className="mt-5 text-3xl font-bold">
                    {employees.length}
                  </p>

                  <p className="mt-2 text-sm text-[#6B6B70]">
                    People in your organization
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E8E5E1] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <p className="text-sm font-medium text-[#6B6B70]">
                    Departments
                  </p>

                  <p className="mt-5 text-3xl font-bold">
                    {departmentCount}
                  </p>

                  <p className="mt-2 text-sm text-[#6B6B70]">
                    Different teams
                  </p>
                </div>
              </section>
            </>
          )}

          {/* Employees Page */}
          {activePage === "employees" && (
            <>
              <p className="text-sm font-medium uppercase tracking-widest text-[#6B6B70]">
                Overview / Employees
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    Employees
                  </h2>

                  <p className="mt-2 text-[#6B6B70]">
                    Manage your team members in one place.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddForm}
                  className="rounded-lg bg-[#FF795F] px-5 py-3 font-semibold transition hover:bg-[#F2674C]"
                >
                  + Add Employee
                </button>
              </div>

              <section className="mt-8 overflow-hidden rounded-2xl border border-[#E8E5E1] bg-white">
                <div className="border-b border-[#E8E5E1] p-5 sm:p-6">
                  <h3 className="text-lg font-bold">
                    All Employees
                  </h3>

                  <p className="mt-1 text-sm text-[#6B6B70]">
                    {employees.length} employee
                    {employees.length === 1 ? "" : "s"} in your team
                  </p>
                </div>

                {employees.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <h4 className="font-semibold">
                      No employees yet
                    </h4>

                    <p className="mt-2 text-sm text-[#6B6B70]">
                      Add your first employee to get started.
                    </p>

                    <button
                      type="button"
                      onClick={openAddForm}
                      className="mt-5 rounded-lg bg-[#FF795F] px-5 py-3 font-semibold transition hover:bg-[#F2674C]"
                    >
                      + Add Employee
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-[#F7F6F3] text-[#6B6B70]">
                        <tr>
                          <th className="px-5 py-4 font-semibold">
                            Employee
                          </th>
                          <th className="px-5 py-4 font-semibold">
                            Role
                          </th>
                          <th className="px-5 py-4 font-semibold">
                            Department
                          </th>
                          <th className="px-5 py-4 font-semibold">
                            Email
                          </th>
                          <th className="px-5 py-4 font-semibold">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {employees.map((employee) => (
                          <tr
                            key={employee.id}
                            className="border-t border-[#E8E5E1] transition hover:bg-[#FCFAF8]"
                          >
                            <td className="px-5 py-4">
                              <p className="font-semibold">
                                {employee.name}
                              </p>
                              <p className="mt-1 text-xs text-[#6B6B70]">
                                Age {employee.age}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-[#6B6B70]">
                              {employee.role}
                            </td>

                            <td className="px-5 py-4">
                              {employee.department}
                            </td>

                            <td className="px-5 py-4 text-[#6B6B70]">
                              {employee.email}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditForm(employee)}
                                  className="rounded-lg border border-[#E8E5E1] px-3 py-2 font-medium transition hover:border-[#FF795F] hover:bg-[#FCE7E1]"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => deleteEmployee(employee.id)}
                                  className="rounded-lg border border-[#F2D5D1] px-3 py-2 font-medium text-[#B42318] transition hover:bg-[#FCE7E1]"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>

      {/* Add / Edit Employee Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-form-title"
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3
                  id="employee-form-title"
                  className="text-xl font-bold"
                >
                  {editingId !== null ? "Edit Employee" : "Add Employee"}
                </h3>

                <p className="mt-1 text-sm text-[#6B6B70]">
                  {editingId !== null
                    ? "Update the employee details below."
                    : "Enter the employee details below."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close form"
                className="rounded-lg px-3 py-2 text-xl text-[#6B6B70] transition hover:bg-[#F7F6F3]"
              >
                ×
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="employee-name"
                  className="mb-1 block text-sm font-medium"
                >
                  Full Name
                </label>

                <input
                  id="employee-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })
                  }
                  placeholder="Enter full name"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="employee-email"
                  className="mb-1 block text-sm font-medium"
                >
                  Email
                </label>

                <input
                  id="employee-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(event) =>
                    setFormData({ ...formData, email: event.target.value })
                  }
                  placeholder="name@example.com"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="employee-role"
                    className="mb-1 block text-sm font-medium"
                  >
                    Role
                  </label>

                  <input
                    id="employee-role"
                    type="text"
                    required
                    value={formData.role}
                    onChange={(event) =>
                      setFormData({ ...formData, role: event.target.value })
                    }
                    placeholder="e.g. Developer"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="employee-age"
                    className="mb-1 block text-sm font-medium"
                  >
                    Age
                  </label>

                  <input
                    id="employee-age"
                    type="number"
                    min="18"
                    max="100"
                    step="1"
                    required
                    value={formData.age}
                    onChange={(event) =>
                      setFormData({ ...formData, age: event.target.value })
                    }
                    placeholder="Enter age"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="employee-department"
                  className="mb-1 block text-sm font-medium"
                >
                  Department
                </label>

                <input
                  id="employee-department"
                  type="text"
                  required
                  value={formData.department}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      department: event.target.value,
                    })
                  }
                  placeholder="e.g. Engineering"
                  className={inputClass}
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-[#FCE7E1] px-4 py-3 text-sm text-[#B42318]"
                >
                  {error}
                </p>
              )}

              <div className="flex flex-wrap justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-[#E8E5E1] px-5 py-3 font-medium transition hover:bg-[#F7F6F3]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-[#FF795F] px-5 py-3 font-semibold transition hover:bg-[#F2674C]"
                >
                  {editingId !== null ? "Update Employee" : "Save Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
