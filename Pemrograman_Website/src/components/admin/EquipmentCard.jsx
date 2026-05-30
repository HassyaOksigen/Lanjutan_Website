import '../styles/Equipment.css'
import trImg from '../assets/peralatan.png'

function EquipmentCard({ data }) {
  return (
    <div className="equip-card">

      <div className="equip-card__img-wrap">
        <img src={trImg} alt={data.name} className="equip-card__img"
        />

        <span className="equip-card__badge">
          Tersedia
        </span>
      </div>

      <div className="equip-card__body">

        <div className="equip-card__top">

          <h3 className="equip-card__name">
            {data.name}
          </h3>

          <span className="equip-card__price">
            {data.price}
          </span>

        </div>

        <span className="equip-card__category">
          {data.category}
        </span>

        <p className="equip-card__desc">
          Traktor pertanian serbaguna 110 HP (81 kW) 4WD dengan High-Pressure Common Rail
        </p>

        <div className="equip-card__tags">

          <span className="equip-tag">
            Rental harian
          </span>

          <span className="equip-tag">
            Pengiriman
          </span>

        </div>

        <button className="btn btn--equip">
          Lihat Detail
        </button>

      </div>

    </div>
  )
}

export default EquipmentCard