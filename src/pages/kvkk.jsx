import Seo from '../components/Seo';
import Logo from '../components/Logo';
import { SITE } from '../lib/site';

// Standalone legal text — opened from the footer link in a new tab. Bare: no
// nav/floating chrome, no footer, just the document (per studio request:
// "dümdüz bi metin" — plain text, mail-collection disclosure for the contact
// form and the Web3Forms processor it submits through).
export default function Kvkk() {
  return (
    <main id="main" className="kvkk">
      <Seo
        title="KVKK Aydınlatma Metni"
        description="Soft Tension Lab — 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel verilerin işlenmesine ilişkin aydınlatma metni."
        path="/kvkk/"
      />
      <a href="/" className="kvkk__stamp" aria-label="Soft Tension Lab — ana sayfa">
        <Logo variant="monogram" decorative />
      </a>
      <div className="kvkk__inner wrap">
        <p className="kvkk__eyebrow">Yasal</p>
        <h1 className="kvkk__title">KVKK Aydınlatma Metni</h1>
        <p className="kvkk__updated">Son güncelleme: 17.09.2026</p>

        <section className="kvkk__section">
          <h2>1. Veri Sorumlusu</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, veri sorumlusu sıfatıyla
            Soft Tension Lab ("Stüdyo", "biz"), softtensionlab.com internet sitesi ("Site") üzerinden
            iletişim formunu doldurmanız halinde ilettiğiniz kişisel verilerinizi işbu aydınlatma
            metninde açıklanan kapsam ve amaçlarla işlemektedir.
          </p>
        </section>

        <section className="kvkk__section">
          <h2>2. İşlenen Kişisel Veriler</h2>
          <p>Site üzerindeki iletişim formu aracılığıyla aşağıdaki kişisel verileriniz işlenmektedir:</p>
          <ul>
            <li>Kimlik bilgisi: ad soyad</li>
            <li>İletişim bilgisi: e-posta adresi, telefon numarası</li>
            <li>
              Talep/proje bilgisi: şirket veya marka adı, sektör, proje türü, proje açıklaması, hedef
              teslim tarihi, bütçe aralığı ve formda paylaştığınız diğer serbest metin cevaplar
            </li>
          </ul>
        </section>

        <section className="kvkk__section">
          <h2>3. İşleme Amaçları</h2>
          <p>Kişisel verileriniz;</p>
          <ul>
            <li>talebinizi değerlendirip size dönüş yapabilmek,</li>
            <li>proje teklifi ve iletişim süreçlerini yürütebilmek,</li>
            <li>Site'nin ve iletişim formunun güvenliğini sağlamak (istenmeyen/otomatik gönderimlerin önlenmesi)</li>
          </ul>
          <p>amaçlarıyla, KVKK'nın 5. maddesinde yer alan "ilgili kişinin talebi üzerine sözleşmenin
            kurulması veya ifasıyla doğrudan ilgili olması" ve "veri sorumlusunun meşru menfaati"
            hukuki sebeplerine dayanılarak işlenmektedir.
          </p>
        </section>

        <section className="kvkk__section">
          <h2>4. Kişisel Verilerin Aktarılması</h2>
          <p>
            İletişim formu, form gönderimini teknik olarak ileten bir e-posta iletim hizmeti (Web3Forms)
            üzerinden Stüdyo'nun gelen kutusuna ulaştırılır; bu hizmet sağlayıcı, ilettiğiniz verileri
            yalnızca mesajı iletmek amacıyla, veri işleyen sıfatıyla işler. Kişisel verileriniz, yukarıda
            sayılanlar dışında, açık rızanız veya kanunda öngörülen bir istisna olmaksızın üçüncü
            kişilerle paylaşılmaz.
          </p>
        </section>

        <section className="kvkk__section">
          <h2>5. Toplama Yöntemi</h2>
          <p>
            Kişisel verileriniz, Site üzerindeki iletişim formunu doldurup göndermeniz suretiyle,
            elektronik ortamda doğrudan sizin tarafınızdan sağlanarak toplanmaktadır.
          </p>
        </section>

        <section className="kvkk__section">
          <h2>6. Saklama Süresi</h2>
          <p>
            Kişisel verileriniz, talebinizin değerlendirilmesi ve olası bir iş ilişkisinin
            kurulabilmesi için gerekli süre boyunca, ilgili mevzuatta öngörülen zamanaşımı süreleri de
            gözetilerek saklanır; bu sürenin sonunda silinir, yok edilir veya anonim hale getirilir.
          </p>
        </section>

        <section className="kvkk__section">
          <h2>7. KVKK Madde 11 Kapsamındaki Haklarınız</h2>
          <p>KVKK'nın 11. maddesi uyarınca Stüdyo'ya başvurarak;</p>
          <ul>
            <li>kişisel verinizin işlenip işlenmediğini öğrenme,</li>
            <li>işlenmişse buna ilişkin bilgi talep etme,</li>
            <li>işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
            <li>yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
            <li>eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
            <li>
              KVKK'nın 7. maddesindeki şartlar çerçevesinde silinmesini veya yok edilmesini isteme,
            </li>
            <li>düzeltme, silme veya yok etme işlemlerinin aktarılan üçüncü kişilere bildirilmesini isteme,</li>
            <li>işlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi nedeniyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
            <li>kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
          </ul>
          <p>haklarına sahipsiniz.</p>
        </section>

        <section className="kvkk__section">
          <h2>8. Başvuru Yöntemi</h2>
          <p>
            Yukarıda sayılan haklarınıza ilişkin taleplerinizi, kimliğinizi tevsik edici bilgilerle
            birlikte{' '}
            <a className="link" href={`mailto:${SITE.email}`}>{SITE.email}</a>{' '}
            adresine e-posta göndererek Stüdyo'ya iletebilirsiniz. Talebiniz, niteliğine göre en kısa
            sürede ve en geç yasal azami süre içinde sonuçlandırılır.
          </p>
        </section>

        <p className="kvkk__back">
          <a className="link" href="/">← Ana sayfaya dön</a>
        </p>
      </div>
    </main>
  );
}
Kvkk.bare = true;
