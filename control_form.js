//Variables que representan los datos de cada formulario:
let form1Data 
let form2Data 
let form3Data 
//Constantes que representan elementos del dom:
const form1 = document.getElementById('form1')
const form2 = document.getElementById('form2')
const form3 = document.getElementById('form3')
const sectionRes = document.getElementById('secRes')
const secExp = document.getElementById('scrollable_list')
const expNinpt = document.getElementById('egN')
const expMinpt = document.getElementById('egM')
const dateF1 = document.getElementById('datBorn')
const dateF3 = document.getElementById('dateObj')
const resForms = document.getElementById('resForms')
//Variables que representan el objeto de gastos y la varible del total de gastos
let exp = {}
let totExp = 0
//LIBRERIA PARA FORMATEAR FECHAS
dayjs.locale('es');
//Obtener la fecha actual:
const actualDate = dayjs()
//Configurar las fechas minimas y maximas de los formularios
dateF1.max = `${actualDate.subtract(18, 'year').format('YYYY-MM-DD')}`
dateF3.min = `${actualDate.add(3, 'month').format('YYYY-MM-DD')}`
//escuchador del evento de envio del formulario 1
form1.addEventListener('submit',(e) => {
    e.preventDefault()
    form1Data = new FormData(e.target)//captura el formulario en un objeto form_data
    form1.style.display = 'none'
    form2.style.display = 'block'
})

//escuchador del evento de envio del formulario 2
form2.addEventListener('submit',(e) => {
    e.preventDefault()
    expNinpt.disabled = true
    expMinpt.disabled = true
    form2Data = new FormData(e.target)
    //se añaden los gastos hormigas al formulario y al total de gastos
    totExp += parseFloat(form2Data.get('Gastos_Hormiga'))
    exp['Gastos_Hormiga'] = parseFloat(form2Data.get('Gastos_Hormiga'))
    //Condicional que se asegura que el usuario no ingreso gastos mas grandes que sus ingresos
    if (!(totExp >= parseFloat(form2Data.get('Ingresos')))) {
        form2.style.display = 'none'
        form3.style.display = 'block'
    } else {
        alert('¡Los gastos superan superan los ingresos! vuelva a registrar los datos')
        exp  = {}
        totExp = 0
        secExp.replaceChildren()
        expNinpt.disabled = false
        expMinpt.disabled = false
    } 
})
// Escuchador del evento de click en el boton de añadir gasto
document.getElementById('addExp').addEventListener('click', (e) => {
    e.preventDefault()
    //Evalua que los campos de nombre y monto del gasto no esten vacios
    if (expNinpt.value.trim() !== '' && expMinpt.value.trim() !== '') {
        let htmlElmt
        //Evalua que no exista ya un gasto con el mismo nombre
        //Si ese es el caso, elimina de la lista el gasto repetido y lo vuelve a insertar con el monto actualizado
        if (exp[expNinpt.value]) {
            document.getElementById(expNinpt.value).remove()
            htmlElmt = `<p id = "${expNinpt.value}">${expNinpt.value}: $${expMinpt.value} <button value = "${expNinpt.value}">Eliminar</button></p>`
            secExp.insertAdjacentHTML('beforeend', htmlElmt)
            totExp -= exp[expNinpt.value]
            totExp += parseFloat(expMinpt.value)
            //Si no, inserta a la lista un gasto como de costumbre
        } else {
            htmlElmt = `<p id = "${expNinpt.value}">${expNinpt.value}: $${expMinpt.value} <button value = "${expNinpt.value}">Eliminar</button></p>`
            secExp.insertAdjacentHTML('beforeend', htmlElmt)
            totExp += parseFloat(expMinpt.value)
        }
        exp[expNinpt.value] = parseFloat(expMinpt.value)
        expNinpt.value = ''
        expMinpt.value = ''
    } else {
        alert('Faltan Campos')
    }
})
//Escuchador del evento de clik en la lista de los gastos
//El evento del callback responde a una eliminacion de un gasto de la lista
secExp.addEventListener('click', (e) => {
    e.preventDefault()
    if (e.target.tagName === 'BUTTON') {
        totExp -= exp[e.target.value]
        delete exp[e.target.value]
        e.target.parentElement.remove()
        console.log(totExp)
        console.log(exp)
    }
})
//Escuchador del evento de envio del formulario 3
form3.addEventListener('submit',(e) => {
    e.preventDefault()
    form3Data = new FormData(e.target)
    calculateParams(form2Data, form3Data)
    form3.style.display = 'none'
    sectionRes.style.display = 'block'
})
//Funcion que declara varios parametros necesarios para hacer el calculo del presupuesto
function calculateParams(f2, f3){
    const inc = parseFloat(f2.get('Ingresos')) 
    const antDr = parseFloat(f2.get('Gastos_Hormiga')) / 30
    const salDrNet = parseFloat(((inc - totExp) / 30))
    const dateObjt = dayjs(f3.get('Plazo_del_objetivo'))
    const objtDays = dateObjt.diff(actualDate.startOf('day'), 'day')
    const amntObjt = parseFloat(f3.get('Monto_del_Objetivo'))
    const saveDr = (amntObjt / objtDays)
    const newDate = actualDate.add(Math.round(amntObjt / (salDrNet + antDr)), 'day') 
    let res = ''
    //Segun los parametros, se evalua si hemos cumplido el objetivo, si no, o si lo hemos cumplido parcialmente
    if (salDrNet >= saveDr) {
        res = 'cumplido'
    } else if((salDrNet + antDr) >= saveDr){
        res = 'Parcial'
    }else{
        res = 'no cumplido'
    }
    showInfo(res, inc, salDrNet, amntObjt, dateObjt, saveDr, newDate, antDr)
}
//funcion que muestra informacion del usuario y los resultados del calculo en el dom
function showInfo(res, inc, salDrNet, amntObjt, dateObjt, saveDr, newDate, antDr){
    //Muestra los datos del formulario 1:
    resForms.insertAdjacentHTML('beforeend', '<h2>Datos personales y de contacto:</h2>')
    form1Data.forEach((value, key) => {
    resForms.insertAdjacentHTML('beforeend', `<p>${key}: ${value}</p>`) 
    });
    //Muestra algunos datos importantes sobre la situacion economica del usuario:
    resForms.insertAdjacentHTML('beforeend', '<h2>Datos del presupuesto:</h2>')
    resForms.insertAdjacentHTML('beforeend', `<p>Salario Mensual: ${inc}</p>`)
    resForms.insertAdjacentHTML('beforeend', `<h4>Lista de gastos:</h4>`)
    Object.entries(exp).forEach(([key, value]) => {
        let listEl = `<li>${key} : ${value}</li>`
        resForms.insertAdjacentHTML('beforeend', listEl)
    })
    resForms.insertAdjacentHTML('beforeend', `<p>Total Gastos: ${totExp}</p>`)
    resForms.insertAdjacentHTML('beforeend', `<p>Salario diario Neto: ${salDrNet.toFixed(2)}</p>`)
    //Muestra los datos y los resultados del plan que eligio el usuario:
    resForms.insertAdjacentHTML('beforeend', `<h2>Reporte del Objetivo:</h2>`)
    resForms.insertAdjacentHTML('beforeend', `<p>Objetivo: $${amntObjt}</p>`)
    resForms.insertAdjacentHTML('beforeend', `<p>Fecha Planteada: ${dateObjt.format('D [de] MMMM [de] YYYY')}</p>`)
    resForms.insertAdjacentHTML('beforeend', `<p>Resultado: ${res}</p>`)
    //segun el estado del resultado, se aciva la seccion correspondiente que contiene la redaccion del resultado
    switch (res) {
        case 'cumplido':
            document.getElementById('cmpld').style.display = 'block'
            document.getElementById('saveDr').innerHTML = saveDr.toFixed(2)
            document.getElementById('saveMt').innerHTML = (saveDr * 30).toFixed(2)
            break;
        case 'parcial':
            document.getElementById('parcial').style.display = 'block'
            document.getElementById('diffAnt').innerHTML = Math.abs((salDrNet - saveDr) * 30).toFixed(2)
            document.getElementById('saveDrPr').innerHTML = saveDr.toFixed(2)
            document.getElementById('saveMtPr').innerHTML = (saveDr * 30).toFixed(2)
            break;
        case 'no cumplido':
            document.getElementById('noCmpld').style.display = 'block'
            document.getElementById('newDate').innerHTML = newDate.format('D [de] MMMM [de] YYYY')
            document.getElementById('newSlDr').innerHTML = (salDrNet + antDr).toFixed(2)
            document.getElementById('newSlMt').innerHTML = ((salDrNet + antDr) * 30).toFixed(2)
            break;
        default:
            break;
    }
    }