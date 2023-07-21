import { useState, useContext } from 'react'
import { AuthContext } from '../../contexts/auth'
import { FiSettings, FiUpload } from 'react-icons/fi'
import { db, storage } from '../../services/firebaseConnection'
import { doc, updateDoc } from 'firebase/firestore'
import { toast } from 'react-toastify'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage' //enviar a foto

import './profile.css'
import avatar from '../../assets/avatar.png'
import Header from '../../components/Header'
import Title from '../../components/Title'

export default function Profile(){

    const { user, setUser, StorageUser, logout } = useContext(AuthContext)

    const [avatarUrl, setAvatarUrl] = useState(user && user.avatarUrl) //se tiver um usuario, ele vai pegar a imagem do avatar
    const [imageAvatar, setImageAvatar] = useState(null)

    const [nome, setNome] = useState(user && user.nome)
    const [email, setEmail] = useState(user && user.email)

    function handleFile(e){
        if (e.target.files[0]){
            const image = e.target.files[0];

            if(image.type === 'image/type' || image.type === 'image/png'){
                setImageAvatar(image)
                setAvatarUrl(URL.createObjectURL(image))
            } else {
                alert("Envie uma imagem do tipo PNG ou JPEG")
                setImageAvatar(null)
                return;
            }

        }
      
    }
   
    async function handleUpload(){
        const currentUid = user.uid;

        const uploadRef = ref(storage, `images/${currentUid}/${imageAvatar.name}`)

        const uploadTask = uploadBytes(uploadRef, imageAvatar)
        .then((snapshot)=> {
            
            getDownloadURL(snapshot.ref).then(async (downloadURL) => {
                let urlFoto = downloadURL;

                const docRef = doc(db, "users", user.uid)
                await updateDoc(docRef, {
                    avatarUrl: urlFoto,
                    nome: nome,
                })
                .then(() => {
                    let data = {
                    ...user, 
                    nome: nome,
                    avatarUrl: urlFoto,
                }    

                setUser(data);
                StorageUser(data);
                toast.success("Atualizado com sucesso")
                })
            })

        })
    }



   async function handleSubmit(e){
        e.preventDefault();  //para naoa atualizar a página

        if(imageAvatar === null && nome !== '') {
        //atuallizar apenas o nome
        const docRef = doc(db, "users", user.uid)     
        await updateDoc(docRef, {
            nome: nome,
        })
        .then(() => {
            let data = {
                ...user, 
                nome: nome,
                }    
            setUser(data);
            StorageUser(data);
            toast.success("Atualizado com sucesso")
        })
        } else if (nome !== '' && imageAvatar !== null ) {
            //atualizar tanto o nome quanto a foto
            handleUpload()
            }
        }
    
    
    return(
        <div>
            <Header/>
            <div className='content'>
                <Title name="Meu perfil">
                    <FiSettings size={25} />    
                </Title> 
                <div className='container'>

                    <form className='form-profile' onSubmit={handleSubmit}>
                        
                        <label className='label-avatar'>
                            <span>
                                <FiUpload color="#fff" size={25} />
                            </span>

                            <input type="file" accept='image/*' onChange={handleFile} /> <br/>
                            {avatarUrl === null ? ( //se a foto estiver vazia , ele pega a imagem do avatar padrão
                                <img src={avatar} alt='Foto de perfil' width={250} height={250} />
                                 ) : (              //se não, ele pega a imagem que fizeram o Upload
                                <img src={avatarUrl} alt='Foto do perfil' width={250} height={250}  />    
                                
                                )}
                        </label>

                        <label>Nome</label>
                        <input type='text' value={nome} onChange={(e) => setNome(e.target.value)} />

                        <label>Email</label>
                        <input type='text' placeholder={email} disable={true} />

                        <button type='submit'>Salvar</button>

                    </form>
                    
                </div>    
            <div>
                <button className='logout-btn' onClick={() => logout()} >Sair</button>
            </div>

            </div>

        </div>
    )
}