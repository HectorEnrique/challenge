/**
 * Funcion que retorna la data de la respuesta
 */
export  const getGeleria = async() => {
  const RESPONSE  = await fetch('https://jsonplaceholder.typicode.com/photos');
  const DATA = RESPONSE.json();
  return DATA;
}
