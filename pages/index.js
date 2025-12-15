import { useState, useEffect, useRef } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Head from "next/head";
import Image1 from "@/pages/image/img1.jpg";
import Image from "next/image";
import { FaToggleOn, FaToggleOff, FaTimes, FaDownload, FaPrint } from 'react-icons/fa';
import { RxLinkedinLogo } from "react-icons/rx";
import { IoMail } from "react-icons/io5";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

function Index() {
  const [isOn, setIsOn] = useState(false);
  const [popup, setPopup] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState([]);

  const [invoiceData, setInvoiceData] = useState({
    customerName: "",
    customerEmail: "",
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    invoiceDate: new Date().toISOString().split('T')[0]
  });

  const invoiceRef = useRef();

  const handleLinkedinClick = () => {
    window.open('https://www.linkedin.com/in/princehoon/')
  }

  const handleEMailClick = () => {
    const email = "princehoon399@gmail.com";
    const subject = "Hello from your portfolio";
    const body = "Hi Prince,\n\nI came across your portfolio and would like to connect with you.";
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  const showData = () => {
    setPopup(true);
  }

  const closePopup = () => {
    setPopup(false)
  }

  // Gst calculation function 

  const calculateItemGST = (item) => {
    const subtotal = item.quantity * item.price;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (item.gstType === "intra") {
      cgst = (subtotal * item.gstRate) / 200;
      sgst = (subtotal * item.gstRate) / 200;
    }
    else {
      igst = (subtotal * item.gstRate) / 100;
    }

    const gstAmount = cgst + sgst + igst;
    const total = subtotal + gstAmount;

    return { subtotal, cgst, sgst, igst, gstAmount, total }
  };

  const calculateInvoiceSummary = () => {
    let totalSubtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let grandTotal = 0;

    invoiceItems.forEach(item => {
      const { subtotal, cgst, sgst, igst, total } = calculateItemGST(item);
      totalSubtotal += subtotal;
      totalCGST += cgst;
      totalSGST += sgst;
      totalIGST += igst;
      grandTotal += total;
    });

    const totalGST = totalCGST + totalSGST + totalIGST;
    return { totalSubtotal, totalCGST, totalSGST, totalIGST, totalGST, grandTotal };
  };

  // Add new Item

  const addNewItem = () => {
    const newItem = {
      id: Date.now(),
      name: "",
      quantity: 1,
      price: 0,
      gstType: "intra",
      gstRate: 18
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const removeItem = (id) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    }
  };


  const updateItem = (id, field, value) => {
    setInvoiceItems(invoiceItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const updateInvoiceData = (field, value) => {
    setInvoiceData({ ...invoiceData, [field]: value });
  };

  // Pdf generate function 

  const downloadInvoicePDF = async () => {
    if (!invoiceRef.current) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: isOn ? '#121212' : '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`invoice-${invoiceData.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };


  // print invoice 

  const printInvoice = () => {
    const printContent = invoiceRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  useEffect(() => {
    document.body.style.backgroundColor = isOn ? '#121212' : '#ffffff';
    document.body.style.color = isOn ? '#ffffff' : '#000000';
    document.body.style.transition = 'all 0.3s ease';
  }, [isOn]);

  const { totalSubtotal, totalCGST, totalSGST, totalIGST, totalGST, grandTotal } = calculateInvoiceSummary();


  return (
    <>
      <Head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');
        </style>
      </Head>
      <div className="card mx-auto text-center d-flex" style={{ width: "50rem", padding: "15px", backgroundColor: isOn ? 'black' : "white", color: isOn ? 'white' : 'black', border: isOn ? '1px solid red' : '1px solid black' }}>
        <Image src={Image1} alt="main-image" className="image-fluid mx-auto" style={{ width: "250px", height: "250px", borderRadius: "15px", border: "2px solid black" }} />

        <div className="mt-5"
          style={{
            display: "flex",
            justifyContent: "flex-start",
            paddingLeft: "20px"
          }}>
          <button
            onClick={() => setIsOn(!isOn)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '48px',
              cursor: 'pointer',
              color: isOn ? '#FFFFFE' : '#9E9E9E',
              // transition: 'color 0.3s',
              display: 'flex',
            }}
          >
            {isOn ? <FaToggleOn /> : <FaToggleOff />}
          </button>
        </div>
        <div className="card-body">
          <div className="card-title h1">Prince Hoon</div>
          <div className="card-text">
            <p className="mt-3 mb-3 text-start fs-5">About Me</p>
            <p className="test start" style={{ textAlign: "left" }}>Hii, I'm Prince Hoon , a MERN Stack Developer .I Specialize in React, Nextjs, Javascript, Full Stack, UI Development and WEB App, I have Done a year of Internship at Indian Oil Corp Ltd.</p>
            <p className="mt-3 mb-3 text-start fs-5">Interests</p>
            <p className="" style={{ textAlign: "left" }}>Riding Bikes, Reading Books, Listening Music, Watching Movies, Palying Video Games</p>

            <div className="text-start mt-4">
              <div className="d-flex flex-column flex-md-row gap-2 gap-md-4">

                <button
                  className="btn btn-primary d-flex align-items-center justify-content-center"
                  onClick={handleLinkedinClick}
                  style={{ minWidth: '140px' }}
                >
                  <RxLinkedinLogo size={20} className="me-2" />
                  LinkedIn
                </button>

                <button
                  className="btn btn-danger d-flex align-items-center justify-content-center"
                  onClick={handleEMailClick}
                  style={{ minWidth: '140px' }}
                >
                  <IoMail size={20} className="me-2" />
                  Email
                </button>
              </div>
            </div>

            <p className="mt-3 mb-3 text-start fs-5">GST Based Mini Project</p>
            <p className="text-start">This Project is a React-Based GST Calculator and Mini Invoice Generator Designed to help users calculate taxes and invoices easily. Users can enter Item Details like, name, quantity and price, and the app automatically calculates the GST(CGST, SGST or IGST) and the total amount. The Project Demonstrates React Skills, state management, Form handling and Dynamic Calculation making it a great Addition to any Developer Portfolio. </p>

            <div className="d-flex flex-column flex-md-row gap-2 gap-md-4">

              <button
                className="btn btn-primary d-flex align-items-center justify-content-center"
                onClick={showData}
                style={{ minWidth: '140px' }}
              >
                Calculate GST & Make an Invoice

              </button>

              {/* popup modal */}
              {
                popup && (
                  <div className="modal show d-block" style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1050
                  }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                      <div className="modal-content" style={{
                        backgroundColor: isOn ? '#1e1e1e' : 'white',
                        color: isOn ? 'white' : 'black'
                      }}>
                        {/* Modal Header */}
                        <div className="modal-header border-bottom">
                          <h5 className="modal-title">GST Calculator & Mini Invoice</h5>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={closePopup}
                            style={{ filter: isOn ? 'invert(1)' : 'none' }}
                          ></button>
                        </div>

                        {/* Modal Body */}
                        <div className="modal-body">
                          {/* Input Section */}
                          <div className="row mb-4">
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">Customer Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={invoiceData.customerName}
                                  onChange={(e) => updateInvoiceData('customerName', e.target.value)}
                                  placeholder="Enter customer name"
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">Customer Email</label>
                                <input
                                  type="email"
                                  className="form-control"
                                  value={invoiceData.customerEmail}
                                  onChange={(e) => updateInvoiceData('customerEmail', e.target.value)}
                                  placeholder="customer@example.com"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Item Input Section */}
                          <div className="card mb-4">
                            <div className="card-header d-flex justify-content-between align-items-center">
                              <h6 className="mb-0">Add Item</h6>
                              <button className="btn btn-sm btn-success" onClick={addNewItem}>
                                + Add Item
                              </button>
                            </div>
                            <div className="card-body">
                              {invoiceItems.length === 0 ? (
                                <p className="text-center text-muted">No items added yet. Click "Add Item" to start.</p>
                              ) : (
                                invoiceItems.map((item, index) => (
                                  <div key={item.id} className="row g-3 mb-3 align-items-end">
                                    <div className="col-md-3">
                                      <label className="form-label">Item Name</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={item.name}
                                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                        placeholder="Item name"
                                      />
                                    </div>
                                    <div className="col-md-2">
                                      <label className="form-label">Quantity</label>
                                      <input
                                        type="number"
                                        className="form-control"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                      />
                                    </div>
                                    <div className="col-md-2">
                                      <label className="form-label">Price (₹)</label>
                                      <input
                                        type="number"
                                        className="form-control"
                                        min="0"
                                        step="0.01"
                                        value={item.price}
                                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                      />
                                    </div>
                                    <div className="col-md-2">
                                      <label className="form-label">GST Type</label>
                                      <select
                                        className="form-select"
                                        value={item.gstType}
                                        onChange={(e) => updateItem(item.id, 'gstType', e.target.value)}
                                      >
                                        <option value="intra">Intra-State</option>
                                        <option value="inter">Inter-State</option>
                                      </select>
                                    </div>
                                    <div className="col-md-2">
                                      <label className="form-label">GST Rate (%)</label>
                                      <select
                                        className="form-select"
                                        value={item.gstRate}
                                        onChange={(e) => updateItem(item.id, 'gstRate', parseInt(e.target.value))}
                                      >
                                        <option value={5}>5%</option>
                                        <option value={12}>12%</option>
                                        <option value={18}>18%</option>
                                        <option value={28}>28%</option>
                                      </select>
                                    </div>
                                    <div className="col-md-1">
                                      {invoiceItems.length > 1 && (
                                        <button
                                          className="btn btn-danger btn-sm"
                                          onClick={() => removeItem(item.id)}
                                        >
                                          ×
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Invoice Preview Section */}
                          <div ref={invoiceRef} className="invoice-preview p-4" style={{
                            backgroundColor: isOn ? '#2a2a2a' : '#f8f9fa',
                            borderRadius: '8px',
                            border: '1px solid #dee2e6'
                          }}>
                            {/* Invoice Header */}
                            <div className="text-center mb-4">
                              <h4>GST Calculator & Mini Invoice</h4>
                              <div className="d-flex justify-content-center gap-4">
                                <p className="mb-1"><strong>Invoice #:</strong> {invoiceData.invoiceNumber}</p>
                                <p className="mb-1"><strong>Date:</strong> {invoiceData.invoiceDate}</p>
                              </div>
                            </div>

                            {/* Bill From/To */}
                            <div className="row mb-4">
                              <div className="col-6">
                                <h6>Bill From:</h6>
                                <p className="mb-1"><strong>Prince Hoon</strong></p>
                                <p className="mb-1">MERN Stack Developer</p>
                                <p className="mb-1">princehoon399@gmail.com</p>
                              </div>
                              <div className="col-6">
                                <h6>Bill To:</h6>
                                <p className="mb-1"><strong>{invoiceData.customerName || "Customer Name"}</strong></p>
                                <p className="mb-1">{invoiceData.customerEmail || "customer@example.com"}</p>
                              </div>
                            </div>


                            {/* Invoice Table */}
                            {invoiceItems.length > 0 ? (
                              <>
                                <div className="table-responsive mb-4">
                                  <table className="table table-bordered">
                                    <thead>
                                      <tr>
                                        <th>Item Name</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>GST Type</th>
                                        <th>GST Rate</th>
                                        <th>CGST</th>
                                        <th>SGST</th>
                                        <th>IGST</th>
                                        <th>Total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {invoiceItems.map((item, index) => {
                                        const { subtotal, cgst, sgst, igst, total } = calculateItemGST(item);
                                        return (
                                          <tr key={item.id}>
                                            <td>{item.name || "Item Name"}</td>
                                            <td>{item.quantity}</td>
                                            <td>₹{item.price.toFixed(2)}</td>
                                            <td>{item.gstType === "intra" ? "Intra" : "Inter"}</td>
                                            <td>{item.gstRate}%</td>
                                            <td className={item.gstType === "intra" ? "" : "text-muted"}>
                                              {item.gstType === "intra" ? `₹${cgst.toFixed(2)}` : "-"}
                                            </td>
                                            <td className={item.gstType === "intra" ? "" : "text-muted"}>
                                              {item.gstType === "intra" ? `₹${sgst.toFixed(2)}` : "-"}
                                            </td>
                                            <td className={item.gstType === "inter" ? "" : "text-muted"}>
                                              {item.gstType === "inter" ? `₹${igst.toFixed(2)}` : "-"}
                                            </td>
                                            <td>₹{total.toFixed(2)}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>

                                {/* Grand Total Section Update */}
                                <div className="text-end">
                                  <div className="card" style={{ width: '350px', marginLeft: 'auto' }}>
                                    <div className="card-body">
                                      <h5 className="card-title">Grand Total</h5>
                                      <h3 className="text-success">₹{grandTotal.toFixed(2)}</h3>
                                      <div className="small text-muted">
                                        <div>Subtotal: ₹{totalSubtotal.toFixed(2)}</div>
                                        {totalCGST > 0 && <div>Total CGST: ₹{totalCGST.toFixed(2)}</div>}
                                        {totalSGST > 0 && <div>Total SGST: ₹{totalSGST.toFixed(2)}</div>}
                                        {totalIGST > 0 && <div>Total IGST: ₹{totalIGST.toFixed(2)}</div>}
                                        <div>Total GST: ₹{totalGST.toFixed(2)}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="text-center py-5">
                                <p className="text-muted">Add items to see invoice preview</p>
                              </div>
                            )}



                          </div>

                          {/* Action Buttons */}
                          <div className="mt-4 d-flex justify-content-center gap-3">
                            <button
                              className="btn btn-primary d-flex align-items-center"
                              onClick={downloadInvoicePDF}
                              disabled={invoiceItems.length === 0}
                            >
                              <FaDownload className="me-2" />
                              Download Invoice
                            </button>
                            <button
                              className="btn btn-success d-flex align-items-center"
                              onClick={printInvoice}
                              disabled={invoiceItems.length === 0}
                            >
                              <FaPrint className="me-2" />
                              Print Invoice
                            </button>
                          </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="modal-footer border-top">
                          <button type="button" className="btn btn-secondary" onClick={closePopup}>
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
            </div>


          </div>

        </div>

      </div>

    </>
  );

}

export default Index;