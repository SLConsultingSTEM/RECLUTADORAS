/**
 * Base de datos simulada de proyectos para el portal de reclutadoras.
 *
 * CÓMO AÑADIR UN SEXTO PROYECTO:
 * 1. Copia uno de los objetos del array (por ejemplo, el de form5).
 * 2. Cambia id (ej. "form6"), nombre, descripcion, imagenUrl y ciudadesPermitidas.
 * 3. Ajusta camposEspecificos con las preguntas exclusivas del nuevo estudio.
 * 4. Agrega una <option value="form6">NOMBRE (XX)</option> en el <select id="proyectos"> de index.html.
 * 5. (Opcional) Elimina o deja de usar el bloque HTML estático #form6 / #info6 cuando el formulario
 *    se genere dinámicamente desde esta configuración.
 */
window.PROYECTOS_DATA = [
  {
    id: "form1",
    nombre: "DERMA PROTECT AD (32)",
    descripcion: `
      <h3>Información de DERMA PROTECT AD (32)</h3>
      <div class="piezareclu" style="text-align: center;">
        <img src="./img/RCL.png" alt="">
      </div>
      <a href="./img/RCL.png" download="RCL.png" class="buttona">Descargar imagen</a>
      <label>Por favor infórmele al participante las siguientes condiciones y la metodología del estudio: </label>
      <ol style="font-weight: bold;">
        <li><span style="font-weight: normal;">El estudio es de manera presencial. Por ende, los participantes deben contar con disponibilidad de tiempo.</span>
        <li><span style="font-weight: normal;">Deberá proporcionar una foto del producto que usa (crema antipañalitis).</span>
        <li><span style="font-weight: normal;">Deberá proporcionar una foto legible donde se evidencie la dirección de residencia con el NSE, y este no debe superar los 2 meses de facturación.</span>
        <li><span style="font-weight: normal;">Se realizará un filtro por parte de la gestora que dura aproximadamente 15 minutos si es efectivo, en caso contrario, durará menos.</span>
        <li><span style="font-weight: normal;">La profesional realizará el encuadre que durará aproximadamente 20 minutos.</span>
        <li><span style="font-weight: normal;">Cuando el producto llegue al participante, la profesional realizará el estatus de recibo que durará aproximadamente 7 minutos.</span>
        <li><span style="font-weight: normal;">Se inicia el uso de las muestras por 7 días, para un total de 14 días de uso. Se realiza 2 evaluaciones monadica una por cada muestra, tiempo aproximado de evaluación 10 minutos.</span>
        <li><span style="font-weight: normal;">Se agenda entrevista final con previo acuerdo entre participante y profesional, entrevista de manera presencial aproximado 1hora y media.</span>
      </ol>
      <label>Tener en cuenta que:</label>
      <ol style="font-weight: bold;">
        <li><span style="font-weight: normal;">En ninguna de sus publicaciones debe incluir nada relacionado con la marca, como el nombre mismo, logos, dibujos o eslogan.</span>
        <li><span style="font-weight: normal;">Es su responsabilidad que todos quienes la apoyen en esta labor no utilicen ninguna referencia a la marca.</span>
        <li><span style="font-weight: normal;">A los participantes se les dará un <b>INCENTIVO</b>,no lo podrá publicar.</span>
        <li><span style="font-weight: normal;">No podrán decir que recibirán el producto como regalo. Un regalo no requiere devolución de información. En este tipo de metodología, por el contrario, es indispensable que nos den información y mantener una comunicación constante.</span>
        <li><span style="font-weight: normal;">Todas las personas deben ser filtradas y/o contactadas por usted. Solo debe hacernos llegar las personas que cumplan con el 100% del perfil solicitado en el archivo adjunto enviado por la gestora. Para esto, por favor solicite la cédula con el fin de validar si tienen la edad requerida para el estudio.</span>
        <li><span style="font-weight: normal;">Todos los datos deben ser registrados con la información completa en el archivo adjunto (Excel enviado por la gestora). En respuesta, usted recibirá dentro las 48 horas siguientes la efectividad de los datos por nuestra parte. </span>
        <li><span style="font-weight: normal;">Al interior de La Pipol Opina haremos un filtro más profundo lo que nos permite reservarnos el derecho de inclusión a nuestros estudios y no siempre se podrán dar las razones de negación. </span>
        <li><span style="font-weight: normal;">Si <b>SL RESEARCH COLOMBIA SAS</b> recibe del <b>RECLUTADOR</b> un dato gestionado de un perfil que ya se encuentra en la base de datos de la empresa, este se considerará como un re-contacto. Teniendo en cuenta lo anterior y que hay una gestión por parte de ustedes, este dato se pagará al 50% del valor del reclutamiento siempre y cuando el participante culmine el proceso. La participación debe ser superior a 3 meses; en caso contrario, no se podrá tener en cuenta en el estudio. En caso de que no haya una gestión por parte de la reclutadora, este dato no se pagará.</span>
      </ol>
    `,
    imagenUrl: "./img/RCL.png",
    ciudadesPermitidas: ["Bogota", "Cali", "Medellin"],
    camposEspecificos: [
      {
        nombre_campo: "nombre_bebe",
        etiqueta: "Nombre del bebé",
        tipo: "text",
      },
      {
        nombre_campo: "genero_bebe",
        etiqueta: "Género del bebé",
        tipo: "select",
        opciones: ["MASCULINO", "FEMENINO"],
      },
      {
        nombre_campo: "usuaria_crema_antipañalitis",
        etiqueta: "Usuaria crema antipañalitis",
        tipo: "text",
      },
    ],
  },

  {
    id: "form2",
    nombre: "DOLOR COL AM (40)",
    descripcion: `
      <h3>Información de DOLOR COL AM (40)</h3>
      <div class="piezareclu" style="text-align: center;">
        <img src="./img/piezareclu.jpg" alt="">
      </div>
      <a href="./img/piezareclu.jpg" download="piezareclu.jpg" class="buttona">Descargar imagen</a>
      <label>Por favor infórmele al participante las siguientes condiciones y la metodología del estudio: </label>
      <ol style="font-weight: bold;">
        <li><span style="font-weight: normal;">El estudio es de manera presencial.</span>
        <li><span style="font-weight: normal;">Deberá proporcionar una foto del producto que usa.</span>
        <li><span style="font-weight: normal;">Deberá proporcionar una foto legible donde se evidencie la dirección de residencia con el NSE, y este no debe superar los 2 meses de facturación.</span>
        <li><span style="font-weight: normal;">Deberá proporcionar la fecha de expedición del documento de identidad.</span>
        <li><span style="font-weight: normal;">Se realizará un filtro por parte de la gestora que durará aproximadamente 15 minutos si es efectivo, en caso contrario, durará menos.</span>
        <li><span style="font-weight: normal;">La profesional realizará el encuadre que durará aproximadamente 20 minutos.</span>
        <li><span style="font-weight: normal;">La medico agendará visita para valoración inicial y entrega de las muestras que durará aproximadamente 20 minutos.</span>
        <li><span style="font-weight: normal;">La profesional realizará el estatus de recibo que durará aproximadamente 7 minutos.</span>
        <li><span style="font-weight: normal;">Se realizarán 2 evaluaciones, una por cada muestra, con un tiempo aproximado de evaluación de 10 minutos. Debe presentar dos episodios por cada rotulo. </span>
        <li><span style="font-weight: normal;">Se agendará una entrevista final con previo acuerdo entre la/el participante y la profesional. La entrevista presencial tiene un tiempo aproximado de hora y cuarenta minutos.</span>
      </ol>
      <label>Tener en cuenta que:</label>
      <ol style="font-weight: bold;">
        <li><span style="font-weight: normal;">En ninguna de sus publicaciones debe incluir nada relacionado con la marca, como el nombre mismo, logos, dibujos o eslogan.</span>
        <li><span style="font-weight: normal;">Es su responsabilidad que todos quienes la apoyen en esta labor no utilicen ninguna referencia a la marca.</span>
        <li><span style="font-weight: normal;">A los participantes se les dará un <b>INCENTIVO</b>,no lo podrá publicar.</span>
        <li><span style="font-weight: normal;">No podrán decir que recibirán el producto como regalo. Un regalo no requiere devolución de información. En este tipo de metodología, por el contrario, es indispensable que nos den información y mantener una comunicación constante.</span>
        <li><span style="font-weight: normal;">Todas las personas deben ser filtradas y/o contactadas por usted. Solo debe hacernos llegar las personas que cumplan con el 100% del perfil solicitado en el archivo adjunto enviado por la gestora. Para esto, por favor solicite la cédula con el fin de validar si tienen la edad requerida para el estudio.</span>
        <li><span style="font-weight: normal;">Todos los datos deben ser registrados con la información completa en el archivo adjunto (Excel enviado por la gestora). En respuesta, usted recibirá dentro las 48 horas siguientes la efectividad de los datos por nuestra parte. </span>
        <li><span style="font-weight: normal;">Al interior de La Pipol Opina haremos un filtro más profundo lo que nos permite reservarnos el derecho de inclusión a nuestros estudios y no siempre se podrán dar las razones de negación. </span>
        <li><span style="font-weight: normal;">Si <b>SL RESEARCH COLOMBIA SAS</b> recibe del <b>RECLUTADOR</b> un dato gestionado de un perfil que ya se encuentra en la base de datos de la empresa, este se considerará como un re-contacto. Teniendo en cuenta lo anterior y que hay una gestión por parte de ustedes, este dato se pagará al 50% del valor del reclutamiento siempre y cuando el participante culmine el proceso. La participación debe ser superior a 3 meses; en caso contrario, no se podrá tener en cuenta en el estudio. En caso de que no haya una gestión por parte de la reclutadora, este dato no se pagará.</span>
      </ol>
    `,
    imagenUrl: "./img/piezareclu.jpg",
    ciudadesPermitidas: ["Bogota", "Medellin", "Barranquilla", "Cali"],
    camposEspecificos: [
      {
        nombre_campo: "parte_dolor",
        etiqueta: "Parte del cuerpo que presenta dolor",
        tipo: "text",
      },
      {
        nombre_campo: "marca_usuaria",
        etiqueta: "Marca usuaria",
        tipo: "text",
      },
      {
        nombre_campo: "presentacion",
        etiqueta: "Presentación",
        tipo: "text",
      },
      {
        nombre_campo: "frecuencia_episodios",
        etiqueta: "Frecuencia de episodios presentados en la semana",
        tipo: "text",
      },
    ],
  },

  {
    id: "form3",
    nombre: "BEBIDA NOCHE NP (3)",
    descripcion: `
      <h3>Información de BEBIDA NOCHE NP (3)</h3>
      <div class="bebidanoche" style="text-align: center;">
        <img src="./img/bebidanoche.png" alt="">
      </div>
      <a href="./img/bebidanoche.png" download="bebidanoche.png" class="buttona">Descargar imagen</a>
      <label>Infórmele al participante las condiciones y la metodología del estudio: </label>
      <ol style="font-weight: bold;">
        <li><span style="font-weight: normal;">El estudio es de manera <b>presencial.</b></span>
        <li><span style="font-weight: normal;">Se le solicitará una foto legible donde se evidencie la dirección de residencia con el NSE y este no deberá superar los 2 meses de facturación.</span>
        <li><span style="font-weight: normal;">Se realiza un filtro por parte de la gestora que dura aproximadamente 15 minutos si es efectivo, en caso contrario durara menos. </span>
        <li><span style="font-weight: normal;">La profesional realiza el encuadre que dura aproximadamente 20 minutos. </span>
        <li><span style="font-weight: normal;">Cuando el producto le llega al participante la profesional realiza estatus de recibo que dura aproximadamente 7 minutos. </span>
        <li><span style="font-weight: normal;">Se realiza seguimiento a la aparición del síntoma cada 7 días vía WhatsApp (los días jueves) </span>
        <li><span style="font-weight: normal;">Inicia uso de la primera muestra, realizan evaluación monadica que dura 10 minutos, se programa para entrevista inicial presencial y entrega de segunda muestra. tiempo aproximado de 1 hora y 30 minutos. </span>
        <li><span style="font-weight: normal;">Se realiza seguimiento a la aparición del síntoma cada 7 días vía WhatsApp (los días jueves) </span>
        <li><span style="font-weight: normal;">Inicia uso de la segunda muestra, realizan evaluación monadica que dura 10 minutos, y se agenda acuerdo entre participante y profesional, entrevista final presencial tiempo aproximado 1 hora y 45 minutos. </span>
      </ol>
      <label>Tener en cuenta que:</label>
      <ol style="font-weight: bold;">
        <li><span style="font-weight: normal;">En ninguna de sus publicaciones se deberá incluir nada relacionado con la marca, como lo son el nombre mismo, logos, dibujos, eslogan.</span>
        <li><span style="font-weight: normal;">Es su responsabilidad que todos quienes la apoyen esta labor no utilicen ninguna referencia a la marca.</span>
        <li><span style="font-weight: normal;">A los participantes se les dará un <b>INCENTIVO</b>,no lo podrá publicar.</span>
        <li><span style="font-weight: normal;">No se debe hablar de que recibirá producto como regalo … un regalo no requiere devolución de información, en este tipo de metodología por el contrario es indispensable que nos den información y estar en constante comunicación. </span>
        <li><span style="font-weight: normal;">Todas las personas deberán ser filtradas y/o contactadas por usted, solo deberá hacernos llegar las personas que cumplan con el 100% del perfil solicitado en el archivo adjunto enviado por la gestora. Para esto por favor solicitar la cedula con el fin de que validen si tiene la edad requerida para el estudio.</span>
        <li><span style="font-weight: normal;">Todos los datos deberán ser registrados con la información completa en el archivo adjunto (Excel enviado por la gestora), en este mismo documento usted exigirá la efectividad de los datos por nuestra parte.</span>
        <li><span style="font-weight: normal;">Al interior de La Pipol Opina haremos un filtro más profundo lo que nos permite reservarnos el derecho de inclusión a nuestros estudios y no siempre se podrán dar las razones de negación.</span>
        <li><span style="font-weight: normal;">Si <b>SL RESEARCH COLOMBIA SAS</b> recibe del <b>RECLUTADOR</b> un dato gestionado de un perfil que ya se encuentra en la base de datos de la empresa, este se considerará como un re-contacto. Teniendo en cuenta lo anterior y que hay una gestión por parte de ustedes, este dato se pagará al 50% del valor del reclutamiento siempre y cuando el participante culmine el proceso. La participación debe ser superior a 3 meses; en caso contrario, no se podrá tener en cuenta en el estudio. En caso de que no haya una gestión por parte de la reclutadora, este dato no se pagará.</span>
      </ol>
    `,
    imagenUrl: "./img/bebidanoche.png",
    ciudadesPermitidas: ["Bogota", "Cali"],
    camposEspecificos: [
      {
        nombre_campo: "marca_usuaria",
        etiqueta: "Marca usuaria",
        tipo: "text",
      },
    ],
  },

  {
    id: "form4",
    nombre: "RN (3)",
    descripcion: `
      <h3>Información de RN (3)</h3>
      <div class="piezareclu" style="text-align: center;">
        <img src="./img/Reclutadoras RN (3).png" alt="">
      </div>
      <a href="./img/Reclutadoras RN (3).png" download="piezareclu.jpg" class="buttona">Descargar imagen</a>
      <br>
      <br>
      <h3 style="font-weight: bold;">Condiciones y requisitos del participante</h3>
      <ol style="font-weight: bold;">
        <li><span style="font-weight: normal;"><strong>Modalidad del estudio</strong>, De manera presencial y virtual. Se requiere disponibilidad de tiempo y acceso a internet, manejo de Teams, Zoom, Skype y/o WhatsApp.</span>
        <li><span style="font-weight: normal;"><strong>Foto del producto</strong>, Proporcionar una foto del producto que usa.</span>
        <li><span style="font-weight: normal;"><strong>Foto del comprobante de residencia</strong>, Proporcionar una foto legible que evidencie la dirección de residencia con el NSE, no mayor a 2 meses de facturación.</span>
        <li><span style="font-weight: normal;"><strong>Foto del registro civil y/o certificado de nacido vivo</strong>, Proporcionar una foto del registro civil y/o certificado de nacido vivo.</span>
      </ol>
      <h3 style="font-weight: bold;">Metodología y tiempos del proyecto</h3>
      <ol style="font-weight: bold;">
        <li><span style="font-weight: normal;"><strong>Filtro inicial por parte de la gestora</strong>, Aproximadamente 15 minutos (menos si no es efectivo).</span></li>
        <li><span style="font-weight: normal;"><strong>Encuadre profesional</strong>, 15 minutos.</span></li>
        <li><span style="font-weight: normal;"><strong>Entrevista inicial</strong>, Es de manera virtual, aproximadamente 1 hora.</span></li>
        <li><span style="font-weight: normal;"><strong>Estatus de recibo del producto</strong>, 7 minutos.</span></li>
        <li><span style="font-weight: normal;"><strong>Uso de muestra y evaluación</strong>, Uso de muestra por 5 días. Una evaluación telefónica de 15 minutos y reconfirman agenda de entrevista final.</span></li>
        <li><span style="font-weight: normal;"><strong>Entrevista final</strong>, Es de manera presencial con acuerdo previo, aproximadamente 1 hora.</span></li>
      </ol>
      <label>Reclutadora Tener en cuenta:</label>
      <ol style="font-weight: bold;">
        <li><span style="font-weight: normal;"><strong>Marca en publicaciones</strong>, No incluir nada relacionado con la marca (nombre, logos, dibujos, eslóganes).</span></li>
        <li><span style="font-weight: normal;"><strong>Responsabilidad del apoyo</strong>, Asegurarse de que quienes la apoyen no utilicen referencias a la marca.</span></li>
        <li><span style="font-weight: normal;"><strong>Incentivo</strong>, No publicar el incentivo, según lo indica la pieza gráfica adjunta.</span></li>
        <li><span style="font-weight: normal;"><strong>Producto como regalo</strong>, No decir que el producto es un regalo; es necesario recibir información y mantener comunicación constante.</span></li>
        <li><span style="font-weight: normal;"><strong>Filtrado y contacto de personas</strong>, Solo enviar personas que cumplan con el 100% del perfil.</span></li>
        <li><span style="font-weight: normal;"><strong>Registro de datos</strong>, Registrar los datos completos en el archivo adjunto (Excel enviado por la gestora).</strong></span></li>
        <li><span style="font-weight: normal;"><strong>Filtro interno</strong>, La Pipol Opina realizara un filtro más profundo; nos reservamos el derecho de inclusión sin necesidad de justificar negaciones.</span></li>
        <li><span style="font-weight: normal;"><strong>Re-contacto y pago</strong>, SL RESEARCH COLOMBIA SAS recibe del RECLUTADOR un dato gestionando de un perfil que ya se encuentra en la base de datos de la empresa, este se considerá como un re-contacto. Teniendo en cuenta lo anterior y que hay una gestión por parte de ustedes, este dato se pagará al 50% del valor del reclutamiento siempre y cuando el participante culmine el proceso. La participación debe ser superior a 3 meses; en caso contrario, no se podrá tener en cuenta en el estudio. En caso de que no haya una gestión por parte de la reclutadora, este dato no se pagará.</span></li>
      </ol>
    `,
    imagenUrl: "./img/Reclutadoras RN (3).png",
    ciudadesPermitidas: ["Bogota", "Medellin", "Bucaramanga"],
    camposEspecificos: [
      {
        nombre_campo: "fecha_nacimiento_bebe",
        etiqueta: "Fecha de nacimiento del bebé",
        tipo: "date",
      },
      {
        nombre_campo: "edad_bebe",
        etiqueta: "Edad del bebé",
        tipo: "number",
      },
      {
        nombre_campo: "marca_toallitas",
        etiqueta: "Marca de toallitas húmedas",
        tipo: "text",
      },
    ],
  },

  {
    id: "form5",
    nombre: "T4E0 (46)",
    descripcion: `
      <h3>Información de T4E0 (46)</h3>
      <div class="piezareclu" style="text-align: center;">
        <img src="./img/reclutadoras etapa cero.png" alt="">
      </div>
      <a href="./img/reclutadoras etapa cero.png" download="piezareclu.jpg" class="buttona">Descargar imagen</a>
      <br>
      <br>
      <label>Por favor infórmele al participante las siguientes condiciones y la metodología del estudio:</label>
      <ol style="font-weight: bold;">
        <li><span style="font-weight: normal;">El estudio es de manera presencial. Por ende, los participantes deben contar con disponibilidad de tiempo y/o tenerr acceso a internet .</span>
        <li><span style="font-weight: normal;">Deberá proporcionar una foto del producto que usa o va a usar.</span>
        <li><span style="font-weight: normal;">Deberá proporcionar una foto legible donde se evidencie la dirección de residencia con el NSE, y este no debe superar los 2 meses de facturación.</span>
        <li><span style="font-weight: normal;">Deberá proporcionar una foto del carnet prenatal y/o certificado de nacido vivo.</span>
        <li><span style="font-weight: normal;">Se realizará un filtro por parte de la gestora que dura aproximadamente 15 minutos si es efectivo, en caso contrario, durará menos.</span>
        <li><span style="font-weight: normal;">La profesional realizará el encuadre que durará aproximadamente 20 minutos.</span>
        <li><span style="font-weight: normal;">La profesional agendará una entrevista inicial que durará aproximadamente 1 hora o 1 hora y media.</span>
        <li><span style="font-weight: normal;">Cuando el producto llegue al participante, la profesional realizará el estatus de recibo que durará aproximadamente 7 minutos.</span>
        <li><span style="font-weight: normal;">Se inicia el uso de las muestras por 3 días, para un total de 6 días de uso. Se realizarán 2 evaluaciones, una por cada muestra, con un tiempo aproximado de evaluación de 10 minutos.</span>
        <li><span style="font-weight: normal;">Se agendará una entrevista final con previo acuerdo entre participante y la profesional. La entrevista presencial tiempo aproximado 1 hora, hora y media o 2 horas.</span>
      </ol>
      <label>Tener en cuenta que:</label>
      <ol style="font-weight: bold;">
        <li><span style="font-weight: normal;">En ninguna de sus publicaciones debe incluir nada relacionado con la marca, como el nombre mismo, logos, dibujos o eslogan.</span></li>
        <li><span style="font-weight: normal;">Es su responsabilidad que todos quienes la apoyen en esta labor no utilicen ninguna referencia a la marca.</span></li>
        <li><span style="font-weight: normal;">A los participantes se les dará un INCENTIVO, no lo podrá publicar o como lo indica la pieza gráfica adjunta.</span></li>
        <li><span style="font-weight: normal;">No podrán decir que recibirán el producto como regalo. Un regalo no requiere devolución de información. En este tipo de metodología, por el contrario, es indispensable que nos den información y mantener una comunicación constante.</span></li>
        <li><span style="font-weight: normal;">Todas las personas deben ser filtradas y/o contactadas por usted. Solo debe hacernos llegar las personas que cumplan con el 100% del perfil solicitado en el archivo adjunto enviado por la gestora. Para esto, por favor solicite la cédula con el fin de validar si tienen la edad requerida para el estudio.</span></li>
        <li><span style="font-weight: normal;">Todos los datos deben ser registrados con la información completa en el archivo adjunto (Excel enviado por la gestora). En respuesta, usted recibirá dentro las 48 horas siguientes la efectividad de los datos por nuestra parte.</span></li>
        <li><span style="font-weight: normal;">Al interior de La Pipol Opina haremos un filtro más profundo lo que nos permite reservarnos el derecho de inclusión a nuestros estudios y no siempre se podrán dar las razones de negación.</span></li>
        <li><span style="font-weight: normal;">SL RESEARCH COLOMBIA SAS recibe del RECLUTADOR un dato gestionado de un perfil que ya se encuentra en la base de datos de la empresa, este se considerará como un re-contacto. Teniendo en cuenta lo anterior y que hay una gestión por parte de ustedes, este dato se pagará al 50% del valor del reclutamiento siempre y cuando el participante culmine el proceso. La participación debe ser superior a 3 meses; en caso contrario, no se podrá tener en cuenta en el estudio. En caso de que no haya una gestión por parte de la reclutadora, este dato no se pagará.</span></li>
      </ol>
    `,
    imagenUrl: "./img/reclutadoras etapa cero.png",
    ciudadesPermitidas: ["Bogota", "Cali", "Medellin", "Cartagena"],
    camposEspecificos: [
      {
        nombre_campo: "semanas_gestacion",
        etiqueta: "Semanas de gestación",
        tipo: "number",
      },
      {
        nombre_campo: "fecha_posible_parto",
        etiqueta: "Fecha posible parto",
        tipo: "date",
      },
      {
        nombre_campo: "marca_panal",
        etiqueta: "Usuario (Marca de pañal)",
        tipo: "text",
      },
      {
        nombre_campo: "presentacion",
        etiqueta: "Presentación",
        tipo: "text",
      },
      {
        nombre_campo: "genero_bebe",
        etiqueta: "Género del bebé",
        tipo: "select",
        opciones: ["MASCULINO", "FEMENINO"],
      },
      {
        nombre_campo: "peso_bebe",
        etiqueta: "Peso del bebé",
        tipo: "text",
      },
      {
        nombre_campo: "ciudad",
        etiqueta: "Ciudad",
        tipo: "text",
      },
    ],
  },
];
