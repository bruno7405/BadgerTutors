import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TutorModule = buildModule("TutorModule", (m) => {
  // Default session price (in wei)
  const sessionPrice = m.getParameter("sessionPrice", "10000000000000000"); // 0.01 ETH

  // Deploy the TutorManager contract
  const tutorManager = m.contract("TutorManager");

  // Example: optionally pre-register a tutor (uncomment if needed)
  // const tutorAddress = m.getParameter("tutorAddress", "0x123...");
  // tutorManager.registerTutor(tutorAddress, sessionPrice);

  return { tutorManager };
});

export default TutorModule;
