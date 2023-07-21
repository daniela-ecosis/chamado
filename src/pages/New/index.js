import Header from "../../components/Header";
import Title from "../../components/Title";
import { FiPlusCircle } from "react-icons/fi";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/auth";
import { db } from "../../services/firebaseConnection";
import { collection, getDocs, getDoc, doc, addDoc, updateDoc  } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";


import './new.css'
import { toast } from "react-toastify";

const listRef = collection(db, "customers");

export default function New(){
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const navigate = useNavigate();

    const [customers, setCustomers] = useState([])
    const [loadCustomer, SetLoadCustomer] = useState(true)
    const [customerSelected, setCustomerSelected] = useState([0])

    const [complemento, setComplemento] = useState('')
    const [assunto, setAssunto] = useState('Suporte')
    const [status, setStatus] = useState('Aberto')
    const [idCustomer, setIdCustomer] = useState(false)

    useEffect(() => {
        async function loadCustomer(){
            const querySnapshot = await getDocs(listRef)
            .then((snapshot) => {
                let lista = [] ;
                snapshot.forEach((doc) => {
                    lista.push({
                        id: doc.id,
                        nomeFantasia: doc.data().nomeFantasia
                    })
                    console.log(lista);
                })
                if(snapshot.docs.size === 0) {
                    console.log("Nenhuma empresa encontrada");
                    setCustomers([ {id: '1', nomeFantasia: 'FREELA'} ])
                    SetLoadCustomer(false)
                    return;
                }

                setCustomers(lista);
                SetLoadCustomer(false)

                if(id){
                    loadId(lista);
                }

            })
            .catch((error) => {
                console.log("ERRO AO BUSCAR OS CLIENTES", error)
                SetLoadCustomer(false);
                setCustomers([ {id: '1', nomeFantasia: 'FREELA'} ])
            })
        }
        loadCustomer();
    }, [id]) //id vem do botão de edição para trazer os dados do chamado que será editado

    async function loadId(lista) {
        const docRef = doc(db, "chamados", id);
        await getDoc(docRef)
        .then((snapshot) => {
            setAssunto(snapshot.data().assunto)
            setStatus(snapshot.data().status)
            setComplemento(snapshot.data().complemento)

            let index = lista.findIndex(item => item.id === snapshot.data().clienteId)
            setCustomerSelected(index);
            setIdCustomer(true);
        })
        .catch((error) => {
            console.log(error)
            setIdCustomer(false)
        })
    }


    function handleOptionChange(e){
        setStatus(e.target.value);
        console.log(e.target.value)

    }


    function handleChangeSelect(e){
       setAssunto(e.target.value) 
       
    }

    function handleChangeCustomer(e){
        setCustomerSelected(e.target.value)
        console.log(customers[e.target.value])
    }

    async function handleSubmit(e){
        e.preventDefault();

        if(idCustomer){   
            //Atualizando chamado - se tiver um idCustomer ele não vai registrar porque é uma edição
           const docRef = doc(db, "chamados", id)
           await updateDoc(docRef, {
            cliente: customers[customerSelected].nomeFantasia,
            clienteId: customers[customerSelected].id,
            assunto: assunto,
            complemento: complemento,
            status: status,
            userId: user.uid,
           })
           .then(() => {
            toast.success("Atualizado com sucesso!");
            setCustomerSelected(0);
            setComplemento('');
            navigate('/dashboard')
           })
           .catch((erro) => {
           toast.error("Ops, erro ao atualizar este chamado!") 
           console.log(erro)
           })
            return;
        }

        //Registrat chamado
        await addDoc(collection(db, "chamados"), {
            created: new Date(),
            cliente: customers[customerSelected].nomeFantasia,
            clienteId: customers[customerSelected].id,
            assunto: assunto,
            complemento: complemento,
            status: status,
            userId: user.uid,
        })
        .then(() => {
            toast.success("Chamado registrado!")
            setComplemento('')
            setCustomerSelected(0)
        })
        .catch((error) => {
            toast.error("Ops erro ao registrar, tente mais tarde!")
            console.log(error);
        })
    }

    return(
        <div>
            <Header/>
            <div className="content">
                <Title name={ id ? "Editando Chamado" : "Novo Chamado" }>
                    <FiPlusCircle size={25} />
                </Title>
                
            <div className="container">
                <form className="form-profile" onSubmit={handleSubmit}>
                    
                    <label>Clientes</label>
                    {  
                        loadCustomer ? (
                            <input type="text" disabled={true} value="Carregando..." />
                        ) : (
                            <select value={customerSelected} onChange={handleChangeCustomer}>
                                { customers.map((item, index) => {
                                    return(
                                        <option key={index} value={index} >
                                            {item.nomeFantasia}
                                        </option>
                                    )
                                })}
                            </select>
                        )
                    }

                    <label>Assunto</label>
                    <select value={assunto} onChange={handleChangeSelect} >
                        <option value="Suporte" >Suporte</option>
                        <option value="Visita Tecnica" >Visita Tecnica</option>
                        <option value="Financeiro" >Financeiro</option>
                    </select>

                    <label>Status</label>
                    <div className="status" >
                        <input 
                            type="radio"
                            name="radio"
                            value="Aberto"
                            onChange={handleOptionChange}
                            checked={ status === 'Aberto' }

                        />
                        <span>Em aberto</span>

                        <input 
                            type="radio"
                            name="radio"
                            value="Progresso"
                            onChange={handleOptionChange}
                             checked={ status === 'Progresso' }
                        />
                        <span>Progresso</span>

                           <input 
                            type="radio"
                            name="radio"
                            value="Atendido"
                            onChange={handleOptionChange}
                            checked={ status === 'Atendido' }
                        />
                        <span>Atendido</span>
                    </div>
                    
                    <label>Complemento</label>
                    <textarea 
                        type="text"
                        placeholder="Descreva seu problema aqui..."
                        value={complemento}
                        onChange={(e) => setComplemento(e.target.value)}
                    />
                    
                    <button type="submit" >Registrar</button>

                </form>

            </div>    

        </div>
           
        </div>
    )
}