import { createContext, useContext, useEffect, useState } from 'react';

type contextParams = {
  params: any;
  setParams: (upParams:any) => void
}

const ParamsContext = createContext<contextParams | null>(null);

export const ParamsContextProvider = ({ children } :any) => {
  const [params, _setParams] = useState({isCanvasInitialized: false});
  
  const setParams = (upParams :any) => {
    _setParams(upParams);
    return true;
  }

  useEffect(() => {
    setParams({isCanvasInitialized : false})    
  }, []);
  
  return (
    <ParamsContext.Provider value={{ params, setParams }} >
      { children }
    </ParamsContext.Provider>
  );
}
  
export const useParamsContext = () => useContext(ParamsContext) as contextParams;