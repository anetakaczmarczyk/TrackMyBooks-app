async function getUsers() {
  const res = await fetch("http://localhost:5229/api/users");
  return res.json();
}

export default async function Page() {
  const users = await getUsers();

  return (
    <div>
      <h1>Users</h1>
      {users.map((u: string) => (
        <div key={u}>{u}</div>
      ))}
    </div>
  );
}
getUsers();