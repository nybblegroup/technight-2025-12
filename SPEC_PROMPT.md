# Feature Planning Prompt

## 1. Idea

--- Explain in high level what this product will accomplish ---

## 2. Technical Architecture Blueprint

--- Explain the general architecture to create or reuse from an existing project and how a feature should be validated / coded under the current customer guidelines and document on AGENTS.md file on how to code, run and test each project with clear instructions ----

--- Explain your core technical architecture, how code should be organized in front/back/sdk, guidelines, best practices of you company, FIGMA or globally shared UI components and restrictions such as available third party services, samples and documentation that will be needed to create this solution ---

---- Explain if any service will be mocked for this phase here and integrated later ----

## 3. Requirements

--- Explain your requirements here in extensive detail in use case format (separate them to avoid building big ---

### Feature 1 - API - : XXXX

--- Explain your scenario here in extensive detail in use case format ---
--- Make sure everything is setup on the technical architecture to use the correct components and dependencies as this is the feature building time ---

### Feature 2 - UI - : XXXX

--- Explain your scenario here in extensive detail in use case format and how is linked with API --
--- Include images and FIGMA links to use as a base to build it if needed ----
--- Make sure everything is setup on the technical architecture to use the correct components and dependencies as this is the feature building time ---

## 4. Non Functional Requirements

--- Explain your non functional requirements here in extensive detail in preferred format ---

## 5. Criteria Acceptance / Test Cases

--- Explain your main criteria acceptance to be met for this feature to be considered ready and working accordingly ---

## 6. Considerations / Constraints / Additional Context

--- Explain your core preexisting system considerations, constraints and files/documentation and links critical to understand to build the feature---

## 7. Agent Role

--- Explain the role and additional expertise context the agent should know as expert to resolve ---

--- For example.. I'm using X library that is core to the process so you can add the context here or in a file and direct here to be used in the context ---

## 8. Agent Planning Instructions

We are doing a **NEW BRANCH -> PLAN -> DOCUMENT -> IMPLEMENT -> SMOKE TEST -> CRITERIA ACCEPTANCE TESTS -> COMMIT -> PUSH** process.

### Workflow Steps:

1. **Create a new branch** for this feature based on develop branch name as: `feat/{my-user-name-ask-for-it}/{feature-name-ask-for-it}`

2. **Plan** for the feature building evaluating the best option to do it

3. **Ask for approval**: You need to ask technical or feature doubts before proceeding with the rest of the steps and must be approved by the user before proceeding to document the requirement

4. **Document the requirement**: Document the final technical approved requirement and criteria acceptances in `docs/{feat-name}/{feat-name}-requirement.md`.
   - You should have at the following detailed sections on Overview, Business Requirements (Use Cases), Technical Requirements, Acceptance Criteria, Clarifications

5. **Generate progress checklist**: Generate a separate checklist/progress document that include what you will do as a checklist at: `docs/{feat-name}/{feat-name}-progress.md`

6. **Implement the feature** following our code guidelines:
   - Secure & Human Readable Code
   - Separate UI components and embrace reusability whenever possible
   - Create short / clear methods for business logic and refactor accordingly
   - Follow the 5 SOLID principles for Software Development on all code created
   - Validate the provided code is secure
   - Document the code clearly and all endpoints with Swagger
   - Refactor the code to avoid duplication doing a deep dive code review of your changes
   - Unit test all generated code by at least 90% coverage with complexity
   - Verify the code builds, can be tested and the SDK can be generated on the backend and frontend

7. **SMOKE TEST**: Ask the user to Initiate the SMOKE TEST which will be conducted by the developer/expert user in the local environment running the application (you don't need to run the dev server).
   - Iterate and continue implementing the code changes with the developer
   - Once satisfied with the work continue

8. **Implement test cases** to validate all the criteria acceptance is met and the service returns adequate information (we only test backend/api features for now!)
   - Write them clearly with documented code including the end-to-end test cases on APIs or similar
   - Separate in clear folders the unit testing and the integration tests
   - Execute them and verify they work

9. **Document the implementation** in `docs/{feat-name}/{feat-name}-implementation.md`
   - You should have at the following detailed sections on Overview, Implementation Strategy (which checklist), Implementation Plan (Backend / Frontend), Testing Plan and Deployment Plan (including any DevSecOps updates to pipelines if needed)

10. **Maintain documentation**: Maintain the Requirement documentation and Implementation documentation up-to-date with any changes requested during this session consistently
