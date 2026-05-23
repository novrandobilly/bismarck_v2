import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { uploadPaymentProof, deletePaymentProof } from '@/lib/supabase/payment-storage'

interface UploadProofInput {
  orderId: string
  file: File
}

async function submitProof({ orderId, file }: UploadProofInput): Promise<void> {
  // 1. Check the order exists
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('id')
    .eq('id', orderId)
    .single()
  if (fetchError || !order) throw new Error('Order not found. Please check your Order ID.')

  // 2. Upload the image
  const path = await uploadPaymentProof(file)

  // 3. Get the public URL
  const { data: urlData } = supabase.storage.from('payment-proofs').getPublicUrl(path)

  // 4. Update the order
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      payment_proof_url: urlData.publicUrl,
    })
    .eq('id', orderId)
    .select('id')
    .single()
  if (updateError) {
    await deletePaymentProof(path).catch(() => {})
    throw updateError
  }
}

export function useUploadProof() {
  return useMutation({ mutationFn: submitProof })
}
