import React from "react";

const HomePage: React.FC = () => {
  console.log("HomePage rendering");

  return (
    <div style={{ padding: "2rem", fontSize: "2rem" }}>
      <h1>Welcome</h1>
      <p>This is the homepage.</p>
    </div>
  );
};
export default HomePage;