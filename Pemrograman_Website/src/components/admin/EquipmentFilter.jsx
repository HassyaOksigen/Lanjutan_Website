import '../styles/Equipment.css'

function EquipmentFilter() {
  return (
    <div className="equip-filters">

      <button className="filter-btn filter-btn--active">
        Semua
      </button>

      <button className="filter-btn">
        Traktor
      </button>

      <button className="filter-btn">
        Bajak
      </button>

      <button className="filter-btn">
        Cultivator
      </button>

    </div>
  )
}

export default EquipmentFilter
