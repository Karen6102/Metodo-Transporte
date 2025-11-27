function balanceProblem(costs, supply, demand) {
    const sum = arr => arr.reduce((a, b) => a + b, 0);
    const sSupply = sum(supply);
    const sDemand = sum(demand);

    if (sSupply > sDemand) {
        const extra = sSupply - sDemand;
        demand.push(extra);
        costs = costs.map(row => row.concat([0]));
    } else if (sDemand > sSupply) {
        const extra = sDemand - sSupply;
        supply.push(extra);
        costs.push(new Array(costs[0].length).fill(0));
    }
    return { costs, supply, demand };
}

function costoMinimo(costs, supply, demand) {
    const m = supply.length, n = demand.length;
    const alloc = Array.from({ length: m }, () => new Array(n).fill(0));
    const s = supply.slice(), d = demand.slice();

    while (s.reduce((a, b) => a + b, 0) > 0) {
        let minCost = Infinity, iMin = -1, jMin = -1;
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                if (s[i] > 0 && d[j] > 0 && costs[i][j] < minCost) {
                    minCost = costs[i][j]; iMin = i; jMin = j;
                }
            }
        }
        const qty = Math.min(s[iMin], d[jMin]);
        alloc[iMin][jMin] = qty;
        s[iMin] -= qty; d[jMin] -= qty;
    }
    return alloc;
}

function vogelApproximation(costs, supply, demand) {
    const m = supply.length, n = demand.length;
    const alloc = Array.from({ length: m }, () => new Array(n).fill(0));
    const s = supply.slice(), d = demand.slice();

    const activeRows = () => s.map((v, i) => ({ i, active: v > 0 })).filter(x => x.active).map(x => x.i);
    const activeCols = () => d.map((v, j) => ({ j, active: v > 0 })).filter(x => x.active).map(x => x.j);

    while (s.reduce((a, b) => a + b, 0) > 0 && d.reduce((a, b) => a + b, 0) > 0) {
        const rows = activeRows(), cols = activeCols();

        const rowPenalty = new Array(m).fill(-1);
        rows.forEach(i => {
            const rowCosts = cols.map(j => costs[i][j]);
            if (rowCosts.length >= 2) {
                const sorted = rowCosts.slice().sort((a, b) => a - b);
                rowPenalty[i] = sorted[1] - sorted[0];
            } else if (rowCosts.length === 1) {
                rowPenalty[i] = rowCosts[0];
            }
        });

        const colPenalty = new Array(n).fill(-1);
        cols.forEach(j => {
            const colCosts = rows.map(i => costs[i][j]);
            if (colCosts.length >= 2) {
                const sorted = colCosts.slice().sort((a, b) => a - b);
                colPenalty[j] = sorted[1] - sorted[0];
            } else if (colCosts.length === 1) {
                colPenalty[j] = colCosts[0];
            }
        });

        const maxRowPen = Math.max(...rowPenalty);
        const maxColPen = Math.max(...colPenalty);

        let i, j;
        if (maxRowPen >= maxColPen) {
            i = rowPenalty.indexOf(maxRowPen);
            j = cols.reduce((best, jj) => (best === null || costs[i][jj] < costs[i][best]) ? jj : best, null);
        } else {
            j = colPenalty.indexOf(maxColPen);
            i = rows.reduce((best, ii) => (best === null || costs[ii][j] < costs[best][j]) ? ii : best, null);
        }

        const qty = Math.min(s[i], d[j]);
        alloc[i][j] = qty;
        s[i] -= qty;
        d[j] -= qty;
    }
    return alloc;
}

// 🔹 Nuevo método: Esquina Noroeste
function esquinaNoroeste(costs, supply, demand) {
    const m = supply.length, n = demand.length;
    const alloc = Array.from({ length: m }, () => new Array(n).fill(0));
    const s = supply.slice(), d = demand.slice();

    let i = 0, j = 0;
    while (i < m && j < n) {
        const qty = Math.min(s[i], d[j]);
        alloc[i][j] = qty;
        s[i] -= qty;
        d[j] -= qty;

        if (s[i] === 0) i++; // pasa a la siguiente fila
        if (d[j] === 0) j++; // pasa a la siguiente columna
    }
    return alloc;
}

function totalCost(costs, alloc) {
    let sum = 0;
    for (let i = 0; i < alloc.length; i++) {
        for (let j = 0; j < alloc[0].length; j++) {
            sum += alloc[i][j] * costs[i][j];
        }
    }
    return sum;
}

function parseCSVMatrix(text) {
    const rows = text.trim().split(/\n+/);
    return rows.map(r => r.split(/\s*,\s*/).map(Number));
}

function parseList(text) {
    return text.split(/\s*,\s*/).map(Number).filter(v => !isNaN(v));
}

function renderTable(container, title, data) {
    const div = document.createElement('div');
    const h = document.createElement('h3');
    h.textContent = title;
    div.appendChild(h);

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const cols = data[0]?.length || 0;
    const hr = document.createElement('tr');
    for (let j = 0; j < cols; j++) {
        const th = document.createElement('th');
        th.textContent = `Destino ${j + 1}`;
        hr.appendChild(th);
    }
    thead.appendChild(hr);

    data.forEach((row) => {
        const tr = document.createElement('tr');
        row.forEach((v) => {
            const td = document.createElement('td');
            td.textContent = v;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    div.appendChild(table);
    container.appendChild(div);
}

function renderAllocation(container, title, alloc, supply, demand) {
    const div = document.createElement('div');
    const h = document.createElement('h3');
    h.textContent = title;
    div.appendChild(h);

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const trh = document.createElement('tr');
    const th0 = document.createElement('th');
    th0.textContent = 'Oferta / Destinos';
    trh.appendChild(th0);

    for (let j = 0; j < demand.length; j++) {
        const th = document.createElement('th');
        th.textContent = `D${j + 1} (${demand[j]})`;
        trh.appendChild(th);
    }
    thead.appendChild(trh);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (let i = 0; i < supply.length; i++) {
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = `O${i + 1} (${supply[i]})`;
        tr.appendChild(th);
        for (let j = 0; j < demand.length; j++) {
            const td = document.createElement('td');
            td.textContent = alloc[i][j];
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    div.appendChild(table);
    container.appendChild(div);
}

function run() {
    const supply = parseList(document.getElementById('supply').value);
    const demand = parseList(document.getElementById('demand').value);
    const costs = parseCSVMatrix(document.getElementById('costs').value);

    const summary = document.getElementById('summary');
    const tables = document.getElementById('tables');
    const total = document.getElementById('total');
    tables.innerHTML = '';
    total.textContent = '';

    if (costs.length === 0 || costs[0].length === 0) {
        summary.textContent = 'Error: matriz de costos vacía o mal formateada.';
        return;
    }

    // Balancear oferta y demanda
    const { costs: bCosts, supply: bSupply, demand: bDemand } = balanceProblem(costs, supply, demand);

    // Método Costo Mínimo
    const allocCM = costoMinimo(bCosts, bSupply, bDemand);
    const costCM = totalCost(bCosts, allocCM);

    // Método VAM
    const allocVAM = vogelApproximation(bCosts, bSupply, bDemand);
    const costVAM = totalCost(bCosts, allocVAM);

    // Método Esquina Noroeste
    const allocEN = esquinaNoroeste(bCosts, bSupply, bDemand);
    const costEN = totalCost(bCosts, allocEN);

    // Mostrar resumen
    summary.textContent = `Balanceo realizado. Oferta=${bSupply.reduce((a, b) => a + b, 0)}; Demanda=${bDemand.reduce((a, b) => a + b, 0)}.`;

    // Mostrar tablas y costos
    renderTable(tables, 'Matriz de costos balanceada', bCosts);

    renderAllocation(tables, 'Asignación Costo Mínimo', allocCM, bSupply, bDemand);
    const p1 = document.createElement('p');
    p1.textContent = `Costo total (Costo Mínimo): ${costCM}`;
    tables.appendChild(p1);

    renderAllocation(tables, 'Asignación VAM', allocVAM, bSupply, bDemand);
    const p2 = document.createElement('p');
    p2.textContent = `Costo total (VAM): ${costVAM}`;
    tables.appendChild(p2);

    renderAllocation(tables, 'Asignación Esquina Noroeste', allocEN, bSupply, bDemand);
    const p3 = document.createElement('p');
    p3.textContent = `Costo total (Esquina Noroeste): ${costEN}`;
    tables.appendChild(p3);

    // Comparación final
    total.textContent = `Comparación de costos → Costo Mínimo=${costCM}, VAM=${costVAM}, Esquina Noroeste=${costEN}`;
}

function reset() {
    document.getElementById('supply').value = '7, 9, 18';
    document.getElementById('demand').value = '5, 8, 7, 14';
    document.getElementById('costs').value = `19, 30, 50, 10
70, 30, 40, 60
40, 8, 70, 20`;
    document.getElementById('summary').textContent = 'Reset realizado. Ejecuta para ver resultados.';
    document.getElementById('tables').innerHTML = '';
    document.getElementById('total').textContent = '';
}

// 🔹 Conectar botones
document.getElementById('run').addEventListener('click', run);
document.getElementById('reset').addEventListener('click', reset);
