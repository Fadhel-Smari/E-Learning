export function AffichageErreur({ message }: { message: string }) {
  return (
    <div className="error-box">
      ⚠️ <strong>Erreur :</strong> {message}
    </div>
  );
}