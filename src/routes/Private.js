import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/auth"

export default function Private({children}) {

    const { signed, loading  } = useContext(AuthContext)

    if(loading) {
        return(
        <div></div>
        )
    }

   if(!signed) { //se não estiver logado
   return <Navigate to="/" />

   }
   
    return children
}