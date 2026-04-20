// Verifica se o usuário está logado logo ao carregar a página
async function checkSession() {
    const { data: { session } } = await db.auth.getSession();
    
    if (!session) {
        window.location.href = "login.html";
    }
}

checkSession();

// Função de Logout para o botão "Sair"
async function handleLogout() {
    await db.auth.signOut();
    window.location.href = "login.html";
}



// Função ligada ao botão de "Cadastrar Produto" do seu novo layout
async function handleAddProduct() {
    const nome = document.querySelector('#nome-produto').value;
    const preco = document.querySelector('#preco-produto').value;
    const marca = document.querySelector('#marca-produto').value;
    const fotoArquivo = document.getElementById('foto-produto').files[0];
  
if (!nome || !preco || !marca || !fotoArquivo) {
    Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Por favor, preencha todos os campos e selecione uma foto!",
        footer: "<a href=\"#\">Why do I have this issue?</a>"
    });
    return;
}
try {
        // 1. Upload da Foto para o Supabase Storage
        const nomeArquivo = `${Date.now()}_${fotoArquivo.name}`;
        const { data: uploadData, error: uploadError } = await db.storage
            .from('produtos-imagens') // Nome do seu bucket no Supabase
            .upload(nomeArquivo, fotoArquivo);

        if (uploadError) throw uploadError;

        // 2. Pegar a URL pública da imagem
        const { data: publicUrlData } = db.storage
            .from('produtos-imagens')
            .getPublicUrl(nomeArquivo);

        const fotoUrl = publicUrlData.publicUrl;

        // 3. Salvar no Banco de Dados (Tabela produtos)
        const { error: dbError } = await db
            .from('produtos')
            .insert([
                { nome, marca, preco: parseFloat(preco), imagem_url: fotoUrl }
            ]);

        if (dbError) throw dbError;

        Swal.fire({
            title: "Sucesso!",
            text: "Produto cadastrado com sucesso!",
            icon: "success"
        });
        location.reload(); // Recarrega para limpar os campos

    } catch (error) {
        console.error("Erro na operação:", error.message);
        alert("Erro ao cadastrar produto.");
    }
}
