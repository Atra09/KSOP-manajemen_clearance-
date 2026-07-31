export default function UserMetaCard({ user }) {
  if (!user) return null;

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border p-4 sm:flex-row">
      <img src={user.photo} alt={`Foto ${user.name}`} className="h-24 w-24 rounded-full border-2 border-gray-200" />
      <div className="text-center sm:text-left">
        <h4 className="text-xl font-semibold text-gray-800">{user.name}</h4>
        <p className="text-gray-500">{user.bio}</p>
        <div className="mt-2 flex justify-center gap-2 sm:justify-start">
          {}
        </div>
      </div>
    </div>
  );
}