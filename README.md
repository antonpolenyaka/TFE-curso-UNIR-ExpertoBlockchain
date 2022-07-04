# Autor: Anton Polenyaka
# Titulo: Trabajo Final de Experto

Descripción del Trabajo Final de Experto

Objetivo

El objetivo del presente trabajo es que el alumno realice un diseño y un desarrollo basado en blockchain, en el que aplique y desarrolle los conocimientos adquiridos a lo largo del curso.

Descripción del caso

Una empresa ha desarrollado un sistema de fumigación con drones y nos ha solicitado que desarrollemos una solución basada en la blockchain de Alastria para su uso.

Las características propias de los drones son:
-	Un identificador único y ascendente, comenzando en 1 y que no puede repetirse.
-	La empresa que lo gestiona, que será la única que pueda mandar acciones al dron.
-	Altura máxima y mínima de vuelo.
-	Una lista de pesticidas que puede suministrar. Los pesticidas existentes son cinco y sus nombres son: Pesticida A, Pesticida B, Pesticida C, Pesticida D y Pesticida E.
-	Coste.

La operación de fumigación es inmediata y debe lanzar un evento de parcela fumigada con el ID de la parcela.

Las características de las parcelas son:
-	Un identificador único y ascendente, que comienza en 1 y que no puede repetirse.
-	Un propietario.
-	Altura máxima y mínima de vuelo permitida.
-	Pesticida aceptado, que va a ser uno de la lista de pesticidas descrita anteriormente.

Otras operaciones que debe suministrar la plataforma son:
-	Contratar un dron a la empresa para desinfectar una parcela con un pesticida determinado.
-	Pago de la operación realizada desde la cuenta del propietario a la de la empresa.

Para la gestión de pagos se debe crear un token propio basado en el estándar ERC 20. Además, los drones y las parcelas pueden gestionarse mediante tokens no fungibles basados en el estándar ERC 721.

La empresa solicita tener una interfaz web que le permita registrar los drones y asignarles trabajos. A su vez, también se debe proporcionar una interfaz web para que los propietarios de las parcelas las puedan registrar y tengan la posibilidad de contratar un dron con las características que requiere su parcela y que pueda desplazarse hasta la misma.

Cualquier duda que pueda surgir en el desarrollo de este trabajo debe ser consultada con el cliente; en nuestro caso, lo haremos con el director que tengamos asignado.

Entregables

Como resultado de las actividades propuestas en el apartado anterior el alumno deberá entregar:

-	Una memoria en la que se incluya la siguiente información:
•	Justificación del uso de la tecnología blockchain para resolver el problema propuesto.
•	Análisis y modelo del sistema propuesto.
•	Descripción del entorno de desarrollo utilizado.
•	Instrucciones de despliegue.

-	Testing de la solución:
•	Manual de usuario, incluyendo capturas de pantalla a modo de ejemplo de cada funcionalidad de la solución. Es suficiente con crear una única empresa y un único propietario.
•	Conclusiones.

-	El código desarrollado —del back-end, del front-end y de SmartContracts—.


Criterios de calificación:

-	El análisis y el modelado de la solución se hace de acuerdo con el proceso de ingeniería de software visto en el curso.
-	El código desarrollado sigue las buenas prácticas de seguridad vistas en el curso.
-	Empleo de técnicas como la herencia o el polimorfismo en el desarrollo realizado.
-	Uso eficiente de la gestión del gas.
-	Tener en cuenta conceptos como el escalado, la robustez o la tolerancia a fallos.
-	Utilización de las técnicas de testing vistas en el curso.
-	El plagio en alguna de las partes entregadas es motivo de suspenso automático.




Organización:

El trabajo se puede realizar de forma individual o en grupos de un máximo de tres alumnos. Estos serán los encargados de formar los grupos y deberán proponerlos en el foro asociado a este trabajo.

En el caso de los trabajos en equipo, todos los miembros deberán realizar dicha entrega.

Con respecto a los criterios de calificación, no existen diferencias en los apartados que van a tener que entregar los alumnos que realicen trabajos individuales y los que lo hagan en grupo, pero van a tener diferente nivel de profundidad:

-	Individual: debe incluir en la memoria el diagrama de despliegue y de secuencia. Debe utilizar al menos una herramienta de testing.
-	Grupo de 2 personas: debe incluir en la memoria el diagrama de despliegue, de casos de uso y de secuencia. Debe utilizar al menos dos herramientas de testing.

Grupo de tres personas: debe incluir en la memoria el diagrama de despliegue, de casos de uso, de clases y de secuencia. Debe utilizar al menos tres herramientas de testing, realizando un análisis de seguridad de la solución desarrollada.

Nota: para el desarrollo de la solución, se debe crear una red local de Alastria. Una vez se tiene la solución probada, se debe desplegar en la red Telsius de Alastria. Si por las limitaciones de Telsius se ve que alguna funcionalidad que en local funciona correctamente, no funciona en Telsius, solamente es necesario indicarlo en la memoria.

# Ejecución de tests
truffle test

# Ejecución de coverage
npm install solidity-coverage
truffle run coverage

o/y

# Surya https://www.npmjs.com/package/surya
npm install --save-dev surya
    describe:
    $ ./node_modules/bin/surya describe contracts/MetaCoin.sol
    $ surya describe ./src/contracts/IDron.sol ./src/contracts/IFumigationDronToken.sol ./src/contracts/IPesticides.sol ./src/contracts/IPlot.sol ./src/contracts/IWorks.sol ./src/contracts/Dron.sol ./src/contracts/FumigationDronToken.sol ./src/contracts/Plot.sol ./src/contracts/Works.sol
    mdreport:
    surya mdreport SuryaReport.md ./src/contracts/IDron.sol ./src/contracts/IFumigationDronToken.sol ./src/contracts/IPesticides.sol ./src/contracts/IPlot.sol ./src/contracts/IWorks.sol ./src/contracts/Dron.sol ./src/contracts/FumigationDronToken.sol ./src/contracts/Plot.sol ./src/contracts/Works.sol
    inheritance: Genera el árbol de herencia
    $ surya inheritance contracts MetaCoin.sol | dot Tpng > MetaCoin.png
    graph: Genera un gráfico con el flujo de control
    $ surya graph contracts MetaCoin.sol | dot Tpng > MetaCoin.png

# Diagramas
# sol2uml
sol2uml src/contracts -f png -o ClassDiagram.png -i Migrations.sol