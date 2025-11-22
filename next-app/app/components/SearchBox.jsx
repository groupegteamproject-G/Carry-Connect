// app/components/SearchBox.jsx
export default function SearchBox({ className = "" }) {
  return (
    <div className={`search-box ${className}`}>
      <input
        type="text"
        placeholder="From (City or Country)"
        className="input-field"
      />
      <input
        type="text"
        placeholder="To (City or Country)"
        className="input-field"
      />
      <input type="date" className="input-field" />

      <select className="input-field">
        <option value="">Select Size</option>
        <option>Small</option>
        <option>Medium</option>
        <option>Large</option>
      </select>

      <button className="find-btn">Find Carriers</button>
    </div>
  );
}
