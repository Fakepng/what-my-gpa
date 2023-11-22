import { ChangeEvent, useEffect, useState } from "react";
import { z } from "zod";
import Icon from "@mdi/react";
import { mdiPlus, mdiDeleteEmpty } from "@mdi/js";
import "./App.css";

function App() {
  const creditSchema = z.object({
    grade: z.string().regex(/^[A-D][+-]?|F$/),
    credits: z.number().int().min(1).max(4),
  });

  const creditsSchema = z.array(creditSchema);
  type CreditsSchema = z.infer<typeof creditsSchema>;

  const gradeValue = {
    A: 4,
    "B+": 3.5,
    B: 3,
    "C+": 2.5,
    C: 2,
    "D+": 1.5,
    D: 1,
    F: 0,
  } as const;
  const grades = Object.keys(gradeValue) as (keyof typeof gradeValue)[];

  const [gpa, setGpa] = useState<number>(0);
  const [credits, setCredits] = useState<CreditsSchema>([]);
  const [grade, setGrade] = useState<keyof typeof gradeValue | null>(null);
  const [credit, setCredit] = useState<number | null>(null);

  function handleGrade(event: ChangeEvent<HTMLSelectElement>) {
    const grade = event.target.value as keyof typeof gradeValue;
    setGrade(grade);
  }

  function handleCredit(event: ChangeEvent<HTMLSelectElement>) {
    const credit = parseInt(event.target.value);
    setCredit(credit);
  }

  function calculateGpa(credits: CreditsSchema) {
    if (credits.length === 0) return setGpa(0);

    const totalCredit = credits.reduce((prev, curr) => prev + curr.credits, 0);
    const totalGrade = credits.reduce(
      (prev, curr) =>
        prev + gradeValue[curr.grade as keyof typeof gradeValue] * curr.credits,
      0
    );

    const gpa = totalGrade / totalCredit;
    setGpa(gpa);
    document.title = `GPA: ${gpa}`;
  }

  function handleAdd() {
    if (!grade) return;
    if (!credit) return;

    const currCredits = [...credits, { grade, credits: credit }];
    setCredits(() => currCredits);

    calculateGpa(currCredits);
    localStorage.setItem("credits", JSON.stringify(currCredits));
  }

  function handleRemove(index: number) {
    let currCredits = [...credits];
    currCredits.splice(index, 1);

    setCredits(() => currCredits);
    calculateGpa(currCredits);

    localStorage.setItem("credits", JSON.stringify(currCredits));
  }

  useEffect(() => {
    const credits = JSON.parse(localStorage.getItem("credits") || "[]");
    const parsed = creditsSchema.safeParse(credits);

    if (parsed.success) {
      setCredits(() => parsed.data);
      calculateGpa(parsed.data);
    }
  }, []);

  return (
    <>
      <main className="container text-center">
        <h1 className="text-3xl font-bold py-10">What my GPA</h1>
        <div className="overflow-x-auto">
          <table className="table table-lg text-center">
            <thead>
              <tr>
                <th>
                  <label htmlFor="credits">Credits</label>
                </th>
                <th>
                  <label htmlFor="grade">Grade</label>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {credits.map((credit, index) => (
                <tr key={index}>
                  <td>{credit.credits}</td>
                  <td>{credit.grade}</td>
                  <td>
                    <button
                      className="btn btn-error"
                      onClick={() => handleRemove(index)}
                    >
                      <Icon path={mdiDeleteEmpty} size={1} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td>
                  <select
                    className="select w-full max-w-xs"
                    onChange={handleCredit}
                  >
                    <option disabled selected>
                      Credit
                    </option>
                    {[1, 2, 3, 4].map((credit) => (
                      <option key={credit} value={credit}>
                        {credit}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    className="select w-full max-w-xs"
                    onChange={handleGrade}
                  >
                    <option disabled selected>
                      Grade
                    </option>
                    {grades.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button className="btn btn-success" onClick={handleAdd}>
                    <Icon path={mdiPlus} size={1} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 className="text-3xl pt-10">Your GPA is {gpa}</h3>
      </main>
    </>
  );
}

export default App;
