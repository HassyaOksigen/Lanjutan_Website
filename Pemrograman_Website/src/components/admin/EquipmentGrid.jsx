import EquipmentCard from "./EquipmentCard"
import '../styles/Equipment.css'

function EquipmentGrid() {
    const equipments = [
    {
      name: "John Deere 5075E Tractor",
      price: "10Rp/hari",
      category: "Traktor",
      img: "/img/peralatan.png"
    },
    {
      name: "John Deere 5075E Tractor",
      price: "10Rp/hari",
      category: "Traktor",
      img: "/img/peralatan.png"
    },
    {
      name: "John Deere 5075E Tractor",
      price: "10Rp/hari",
      category: "Traktor",
      img: "/img/peralatan.png"
    },
  ]
  return (
    <div className="equip-grid">

      {equipments.map((item, index) => (
        <EquipmentCard key={index} data={item} />
      ))}

    </div>
  )
}

export default EquipmentGrid
