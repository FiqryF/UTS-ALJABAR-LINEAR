document.getElementById("method").addEventListener("change", handleMethodChange);
document.getElementById("calculate").addEventListener("click", handleCalculate);

function handleMethodChange() {
  const method = this.value;
  const inputSection = document.getElementById("inputSection");
  const matrixInput = document.getElementById("matrixInput");
  matrixInput.innerHTML = "";
  document.getElementById("result").innerHTML = "";

  if (!method) {
    inputSection.style.display = "none";
    return;
  }

  inputSection.style.display = "block";
  if (["penjumlahan", "pengurangan", "perkalian"].includes(method)) {
    createDoubleMatrixInput(3, 3);
  } else if (["invers", "determinan", "sarrus", "kofaktor"].includes(method)) {
    createSingleMatrixInput(3, 3);
  }
}

function createSingleMatrixInput(rows, cols) {
  const table = createMatrixTable("matrixA", rows, cols);
  document.getElementById("matrixInput").appendChild(table);
}

function createDoubleMatrixInput(rows, cols) {
  const labelA = document.createElement("p");
  labelA.textContent = "Matriks A";
  const tableA = createMatrixTable("matrixA", rows, cols);
  const labelB = document.createElement("p");
  labelB.textContent = "Matriks B";
  const tableB = createMatrixTable("matrixB", rows, cols);
  const container = document.getElementById("matrixInput");
  container.appendChild(labelA);
  container.appendChild(tableA);
  container.appendChild(labelB);
  container.appendChild(tableB);
}

function createMatrixTable(idPrefix, rows, cols) {
  const table = document.createElement("table");
  table.className = "matrix-table";
  for (let i = 0; i < rows; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < cols; j++) {
      const cell = document.createElement("td");
      const input = document.createElement("input");
      input.type = "number";
      input.id = `${idPrefix}_${i}_${j}`;
      input.className = "matrix-input";
      cell.appendChild(input);
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
  return table;
}

function getMatrix(idPrefix, rows = 3, cols = 3) {
  const matrix = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      const val = document.getElementById(`${idPrefix}_${i}_${j}`).value;
      row.push(Number(val));
    }
    matrix.push(row);
  }
  return matrix;
}

function handleCalculate() {
  const method = document.getElementById("method").value;
  const resultBox = document.getElementById("result");
  resultBox.innerHTML = "";

  const A = getMatrix("matrixA");
  let B;
  if (["penjumlahan", "pengurangan", "perkalian"].includes(method)) {
    B = getMatrix("matrixB");
  }

  let result;
  switch (method) {
    case "penjumlahan":
      result = matrixOperation(A, B, (a, b) => a + b);
      break;
    case "pengurangan":
      result = matrixOperation(A, B, (a, b) => a - b);
      break;
    case "perkalian":
      result = multiplyMatrices(A, B);
      break;
    case "invers":
      result = inverseMatrix(A);
      break;
    case "determinan":
      const det = determinant3x3(A);
      resultBox.innerHTML = `<p><strong>Determinan:</strong> ${det}</p>`;
      result = inverseMatrix(A);
      if (typeof result === "string") {
        resultBox.innerHTML += `<p>${result}</p>`;
      } else {
        resultBox.innerHTML += `<p><strong>Invers Matriks:</strong></p>${matrixToHTML(result)}`;
      }
      return;
    case "sarrus":
      result = `<p><strong>Determinan (Sarrus):</strong> ${sarrus(A)}</p>`;
      resultBox.innerHTML = result;
      return;
    case "kofaktor":
      const cof = cofactorMatrix(A);
      resultBox.innerHTML = `<p><strong>Determinan:</strong> ${determinant3x3(A)}</p>`;
      resultBox.innerHTML += `<p><strong>Kofaktor Matriks:</strong></p>${matrixToHTML(cof)}`;
      return;
  }

  resultBox.innerHTML = `<p><strong>Hasil:</strong></p>${matrixToHTML(result)}`;
}

function matrixOperation(A, B, op) {
  return A.map((row, i) => row.map((val, j) => op(val, B[i][j])));
}

function multiplyMatrices(A, B) {
  const result = Array(3).fill().map(() => Array(3).fill(0));
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      for (let k = 0; k < 3; k++)
        result[i][j] += A[i][k] * B[k][j];
  return result;
}

function determinant3x3(m) {
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  );
}

function sarrus(m) {
  return (
    m[0][0] * m[1][1] * m[2][2] +
    m[0][1] * m[1][2] * m[2][0] +
    m[0][2] * m[1][0] * m[2][1] -
    m[0][2] * m[1][1] * m[2][0] -
    m[0][0] * m[1][2] * m[2][1] -
    m[0][1] * m[1][0] * m[2][2]
  );
}

function cofactorMatrix(m) {
  const cofactor = (r, c) => {
    const minor = m.filter((_, i) => i !== r).map(row => row.filter((_, j) => j !== c));
    return ((r + c) % 2 === 0 ? 1 : -1) * (minor[0][0] * minor[1][1] - minor[0][1] * minor[1][0]);
  };
  return m.map((_, i) => m[i].map((_, j) => cofactor(i, j)));
}

function inverseMatrix(m) {
  const det = determinant3x3(m);
  if (det === 0) return "Invers tidak tersedia (determinan = 0)";
  const cof = cofactorMatrix(m);
  const adj = transpose(cof);
  return adj.map(row => row.map(val => +(val / det).toFixed(2)));
}

function transpose(m) {
  return m[0].map((_, i) => m.map(row => row[i]));
}

function matrixToString(m) {
  return m.map(row => row.join("\t")).join("\n");
}

function matrixToHTML(matrix) {
  let html = '<table class="matrix-result">';
  for (const row of matrix) {
    html += '<tr>' + row.map(val => `<td>${val}</td>`).join('') + '</tr>';
  }
  html += '</table>';
  return html;
}
