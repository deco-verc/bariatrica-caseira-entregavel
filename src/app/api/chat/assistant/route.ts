import { NextRequest, NextResponse } from 'next/server';
import { chatFlow } from '@/ai/flows/chat-flow';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    const lastMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastMessage) {
      return NextResponse.json({ error: 'No user message found' }, { status: 400 });
    }

    // Executa o fluxo do Genkit
    const response = await chatFlow({
      message: lastMessage.content
    });

    // Se estiver logado, salvar histórico
    if (user) {
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (member) {
        // Salva mensagem do usuário
        await supabase.from('assistant_messages').insert({
          member_id: member.id,
          role: 'user',
          content: lastMessage.content
        });

        // Salva resposta da Carol
        await supabase.from('assistant_messages').insert({
          member_id: member.id,
          role: 'assistant',
          content: response
        });
      }
    }

    return NextResponse.json({ content: response });

  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ 
      error: error.message,
      content: "Desculpe, tive um probleminha técnico agora. Tente me mandar sua pergunta novamente em alguns instantes, por favor 💚"
    }, { status: 500 });
  }
}
