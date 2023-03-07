import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";
import { getGeleria } from "./helpers/galeria";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);

  const [ galeria, setGaleria] = useState([])

  /**
  * Mandar a llamar la API y galeria de imagenes
  * Sin return y params
  */
  useEffect(() => {
    getGeleria().then(data => {
      const IMG_URL = data.map(imagen => {
        return imagen.url;
      })
      setGaleria( IMG_URL );
    });
  }, [])
  
    /**
    * Crea un nuevo componente movible 
    * {Array<String>} - COLORS Con un color que se encuentra en el arreglo de forma aleatoria
    * Todo se almacena en el state -> moveableComponents
    */
  // const getIdImg = galeria => {
  //   return galeria.map(imagen => {
  //     const CONTENIDO = {id: imagen.id, imagenUrl: imagen.url}
  //   })
  // }

  /**
   * Agrega al DOM una figura móvil
   * No retorna ni params
   */
  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    // const COLORS = ["red", "blue", "yellow", "green", "purple"];

    // const {id, imagenUrl} = getIdImg(galeria);
    setMoveableComponents(
      [
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        // id,
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: galeria[Math.floor(Math.random() * galeria.length)],
        updateEnd: true
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };


  /**
   * Indica donde inicia el móvil
   * {Number} e - Posicion del móvil
   *
 */
  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (
    <main style={{ height : "85vh", width: "90vw" }}>
      <button onClick={addMoveable} className="moodB">Agregar Móvil</button>
      <div
        id="parent"
        style={{
          marginTop: "20px",
          position: "relative",
          background: "#FEFCFB",
          height: "85vh",
          width: "90vw",
          overflow: "hidden",
          borderRadius: "15px",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();
  
  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;
    console.log(newHeight);
    console.log(newHeight);

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;
    console.log(positionMaxTop);
    console.log(positionMaxLeft);

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    //beforeTranslate solo toma las posiciones del arreglo [0 y 1];
    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1]; 
    // Se rompe en Y y X ya que se le 'suman' de más valores

    //test
    // console.log(beforeTranslate, translateY)

    // ref.current.style.transform = `translate(${translateX - translateX}px, ${translateY - translateX}px)`;
    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;
    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY - translateY,
      left: left + translateX < 0 ? 0 : left + translateX - translateX,
    });
  };

  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = top + beforeTranslate[1];
    const absoluteLeft = left + beforeTranslate[0];

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        color,
      },
      true
    );
  };
  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          objectFit: "cover",
          top: top,
          left: left,
          width: width,
          height: height,
          backgroundImage: `url(${color})`,
        }}
        onClick={() => setSelected(id)}
      />
      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
          });
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}

      />
    </>
  );
};
